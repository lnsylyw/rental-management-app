import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/profile-settings';
import SystemSettings from '@/components/settings/system-settings';
import SecuritySettings from '@/components/settings/security-settings';
import ImageToPDF from '@/components/tools/image-to-pdf';
import { User, Settings, Shield, Wrench } from 'lucide-react';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import BottomNavigation from '@/components/ui/bottom-navigation';
import NotificationIcon from '@/components/notification/notification-icon';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 顶部导航栏 */}
        <PageHeader
          title="设置"
          icon={Settings}
          backgroundColor="bg-gray-600"
          backPath="/dashboard"
        >
          <NotificationIcon className="text-white hover:bg-gray-700" />
        </PageHeader>

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center justify-center">
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">个人资料</span>
                  <span className="sm:hidden">资料</span>
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center justify-center">
                  <Wrench className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">实用工具</span>
                  <span className="sm:hidden">工具</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">安全设置</span>
                  <span className="sm:hidden">安全</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center justify-center">
                  <Settings className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">系统设置</span>
                  <span className="sm:hidden">系统</span>
                </TabsTrigger>
              </TabsList>
              
              <AnimatedContainer
                animation="fadeInVariants"
                delay={0.3}
                isVisible={activeTab === 'profile'}
              >
                <TabsContent value="profile" className="mt-6">
                  <ProfileSettings />
                </TabsContent>
              </AnimatedContainer>

              <AnimatedContainer
                animation="fadeInVariants"
                delay={0.3}
                isVisible={activeTab === 'tools'}
              >
                <TabsContent value="tools" className="mt-6">
                  <ImageToPDF />
                </TabsContent>
              </AnimatedContainer>

              <AnimatedContainer
                animation="fadeInVariants"
                delay={0.3}
                isVisible={activeTab === 'security'}
              >
                <TabsContent value="security" className="mt-6">
                  <SecuritySettings />
                </TabsContent>
              </AnimatedContainer>
              
              <AnimatedContainer 
                animation="fadeInVariants" 
                delay={0.3} 
                isVisible={activeTab === 'system'}
              >
                <TabsContent value="system" className="mt-6">
                  <SystemSettings />
                </TabsContent>
              </AnimatedContainer>
            </Tabs>
          </main>
        </AnimatedContainer>
        
        {/* 底部导航栏 */}
        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default SettingsPage;