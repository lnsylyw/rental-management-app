import PropertyDetail from '@/components/property/property-detail';
import PageTransition from '@/components/ui/page-transition';
import AnimatedContainer from '@/components/ui/animated-container';
import PageHeader, { PAGE_HEADER_TOP_SPACING } from '@/components/ui/page-header';
import { Building2 } from 'lucide-react';

const PropertyDetailPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 顶部导航栏 */}
        <PageHeader
          title="房屋详情"
          icon={Building2}
          backgroundColor="bg-blue-600"
          backPath="/property"
        />

        {/* 主内容区 */}
        <AnimatedContainer animation="fadeInVariants" delay={0.2}>
          <main className={`container mx-auto p-4 ${PAGE_HEADER_TOP_SPACING}`}>
            <PropertyDetail />
          </main>
        </AnimatedContainer>
      </div>
    </PageTransition>
  );
};

export default PropertyDetailPage;