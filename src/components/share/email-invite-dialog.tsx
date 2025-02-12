import { useState, useRef } from 'react';
import { X, Upload, Loader2, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface EmailInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmailPill {
  email: string;
  valid: boolean;
}

const MAX_EMAILS = 200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailInviteDialog({ open, onOpenChange }: EmailInviteDialogProps) {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailPill[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateEmail = (email: string) => EMAIL_REGEX.test(email.trim());

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    
    if (emails.length >= MAX_EMAILS) {
      toast({
        title: "Maximum emails reached",
        description: `You can only invite up to ${MAX_EMAILS} people at once.`,
        variant: "destructive",
      });
      return;
    }

    if (emails.some(e => e.email === trimmedEmail)) {
      toast({
        title: "Duplicate email",
        description: "This email has already been added.",
        variant: "destructive",
      });
      return;
    }

    const isValid = validateEmail(trimmedEmail);
    setEmails(prev => [...prev, { email: trimmedEmail, valid: isValid }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (e.key === 'Enter' && !validateEmail(currentInput)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }
      addEmail(currentInput);
      setCurrentInput('');
    } else if (e.key === 'Backspace' && currentInput === '' && emails.length > 0) {
      // Remove the last email pill when backspace is pressed and input is empty
      setEmails(prev => prev.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedEmails = pastedText.split(/[,\\n]/).map(email => email.trim());
    
    pastedEmails.forEach(email => {
      if (email) addEmail(email);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const rows = text.split('\\n');
      rows.forEach(row => {
        const email = row.split(',')[0].trim(); // Assume first column is email
        if (email) addEmail(email);
      });
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "There was an error reading your CSV file." + error,
        variant: "destructive",
      });
    }
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) {
      toast({
        title: "No emails added",
        description: "Please add at least one email address.",
        variant: "destructive",
      });
      return;
    }

    const validEmails = emails.filter(e => e.valid).map(e => e.email);
    if (validEmails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please add at least one valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    trackEvent(AnalyticsEvents.RESULTS_SHARED, { 
      platform: 'email_invite',
      count: validEmails.length
    });

    try {
      // Get the current user's ID token
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/send-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emails: validEmails,
          customMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send invites');

      const data = await response.json();
      toast({
        title: "Invites sent!",
        description: data.message,
      });

      onOpenChange(false);
    } catch (err) {
      console.error('Error sending invites:', err);
      toast({
        title: "Error sending invites",
        description: "There was an error sending the invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyReferralLink = async () => {
    if (!user?.uid) return;
    
    const referralLink = `${window.location.origin}/?ref=${user.uid}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setIsLinkCopied(true);
      trackEvent(AnalyticsEvents.RESULTS_SHARED, { 
        platform: 'referral_link',
        type: 'copy'
      });
      toast({
        title: "Link copied!",
        description: "Your custom invite link has been copied to clipboard.",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsLinkCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to your clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Invite Others to Discover Their Spiritual Powers</DialogTitle>
          <DialogDescription>
            Share your spiritual journey and invite others to discover their unique gifts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Input */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[2.5rem] max-h-[12rem] overflow-y-auto">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                    email.valid 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}
                >
                  <span>{email.email}</span>
                  <button
                    onClick={() => setEmails(prev => prev.filter((_, i) => i !== index))}
                    className="hover:text-foreground/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={emails.length === 0 ? "Enter email addresses..." : ""}
                className="flex-1 min-w-[200px] bg-transparent border-0 outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Press Enter or use commas to add multiple emails</span>
              <span>{emails.length}/{MAX_EMAILS}</span>
            </div>
          </div>

          {/* Divider with text */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or share via link</span>
            </div>
          </div>

          {/* Custom Referral Link Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopyReferralLink}
            disabled={!user}
          >
            {isLinkCopied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                Copy Custom Invite Link
              </>
            )}
          </Button>

          {/* CSV Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Add a Personal Message (Optional)</h3>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write a personal message to include in the invitation..."
              className="min-h-[100px]"
            />
          </div>

          {/* Send Button */}
          <Button 
            className="w-full" 
            onClick={handleSendInvites}
            disabled={isSending || emails.length === 0}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Invitations'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 