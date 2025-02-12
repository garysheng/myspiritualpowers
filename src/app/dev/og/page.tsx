'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, Copy, RefreshCw, Star, Users2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LAYOUTS = {
  default: {
    name: 'Default',
    description: 'Standard layout with title and sparkles',
    icon: Sparkles,
  },
  results: {
    name: 'Quiz Results',
    description: 'Shows spiritual gifts and archetype',
    icon: Star,
  },
  community: {
    name: 'Community',
    description: 'Emphasizes the community aspect',
    icon: Users2,
  }
};

export default function OGDesignerPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('Discover Your Spiritual Powers');
  const [subtitle, setSubtitle] = useState('Take the quiz to uncover your unique gifts');
  const [layout, setLayout] = useState<keyof typeof LAYOUTS>('default');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleDownload = () => {
    // TODO: Implement download functionality
    toast({
      title: 'Coming Soon',
      description: 'Download functionality will be added soon',
    });
  };

  const handleCopyAsURL = () => {
    // TODO: Implement copy as URL functionality
    toast({
      title: 'Coming Soon',
      description: 'URL copying will be added soon',
    });
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">OG Image Designer</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyAsURL}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy as URL
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`aspect-[1200/630] w-full rounded-lg ${
                theme === 'dark' ? 'bg-background' : 'bg-white'
              } p-8 relative overflow-hidden shadow-2xl`}>
                {/* Default Layout Preview */}
                {layout === 'default' && (
                  <div className="h-full flex flex-col items-center justify-center relative">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
                    
                    {/* Floating Elements */}
                    <div className="absolute top-12 right-12 animate-pulse">
                      <Star className="w-8 h-8 text-violet-400/30" />
                    </div>
                    <div className="absolute bottom-12 left-12 animate-pulse delay-300">
                      <Wand2 className="w-8 h-8 text-indigo-400/30" />
                    </div>
                    
                    {/* Main Content */}
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                      <Sparkles className="w-20 h-20 text-primary relative" />
                    </div>
                    
                    <div className="relative mt-8 max-w-3xl">
                      <h1 className={`text-5xl md:text-6xl font-bold text-center mb-6 tracking-tight ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      } [text-shadow:_0_1px_10px_rgb(0_0_0_/_20%)]`}>
                        {title}
                      </h1>
                      <p className={`text-xl md:text-2xl text-center ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      } tracking-wide`}>
                        {subtitle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Results Layout Preview */}
                {layout === 'results' && (
                  <div className="h-full flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
                    
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                      <Star className="w-20 h-20 text-primary relative" />
                    </div>
                    
                    <div className="relative mt-8 max-w-3xl">
                      <h1 className={`text-5xl md:text-6xl font-bold text-center mb-6 tracking-tight ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      } [text-shadow:_0_1px_10px_rgb(0_0_0_/_20%)]`}>
                        {title}
                      </h1>
                      <p className={`text-xl md:text-2xl text-center ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      } tracking-wide`}>
                        {subtitle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Community Layout Preview */}
                {layout === 'community' && (
                  <div className="h-full flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-indigo-500/10" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
                    
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-primary/20 to-indigo-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
                      <Users2 className="w-20 h-20 text-primary relative" />
                    </div>
                    
                    <div className="relative mt-8 max-w-3xl">
                      <h1 className={`text-5xl md:text-6xl font-bold text-center mb-6 tracking-tight ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      } [text-shadow:_0_1px_10px_rgb(0_0_0_/_20%)]`}>
                        {title}
                      </h1>
                      <p className={`text-xl md:text-2xl text-center ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      } tracking-wide`}>
                        {subtitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select
                    value={layout}
                    onValueChange={(value: string) => setLayout(value as keyof typeof LAYOUTS)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a layout" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LAYOUTS).map(([key, { name, description, icon: Icon }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <div className="space-y-1">
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground">{description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Tabs value={theme} onValueChange={(value: string) => setTheme(value as 'dark' | 'light')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="dark">Dark</TabsTrigger>
                      <TabsTrigger value="light">Light</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter subtitle"
                  />
                </div>

                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    setTitle('Discover Your Spiritual Powers');
                    setSubtitle('Take the quiz to uncover your unique gifts');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 