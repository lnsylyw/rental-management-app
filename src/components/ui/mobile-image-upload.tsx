import React, { useRef } from 'react';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/components/ui/use-mobile';

interface MobileImageUploadProps {
  onFileSelect: (files: FileList) => void;
  multiple?: boolean;
  accept?: string;
  className?: string;
  children?: React.ReactNode;
  capture?: 'user' | 'environment';
}

export const MobileImageUpload: React.FC<MobileImageUploadProps> = ({
  onFileSelect,
  multiple = false,
  accept = "image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp",
  className = "",
  children,
  capture = "environment"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files);
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        capture={isMobile ? capture : undefined}
        onChange={handleFileChange}
      />
      
      {children ? (
        <div onClick={triggerFileSelect} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <div className="space-y-2">
          {isMobile ? (
            // 移动端显示拍照和选择图片两个选项
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // 设置capture属性并触发选择
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }
                }}
                className="flex flex-col items-center justify-center h-20"
              >
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-xs">拍照</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // 移除capture属性并触发选择
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                className="flex flex-col items-center justify-center h-20"
              >
                <ImageIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">相册</span>
              </Button>
            </div>
          ) : (
            // 桌面端显示标准上传按钮
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileSelect}
              className="w-full h-20 flex flex-col items-center justify-center"
            >
              <Upload className="h-6 w-6 mb-1" />
              <span className="text-sm">选择图片</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileImageUpload;
