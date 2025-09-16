import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Download, 
  FileText, 
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Trash2,
  Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  rotation: number;
}

const ImageToPDF: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > 50) {
      toast({
        title: '图片数量超限',
        description: `最多只能选择50张图片，当前已选择${images.length}张`,
        variant: 'destructive'
      });
      return;
    }

    const validFiles = files.filter(file => {
      // 检查文件类型
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast({
          title: '文件格式错误',
          description: `${file.name} 不是有效的图片文件`,
          variant: 'destructive'
        });
        return false;
      }

      // 检查文件大小（50MB = 50 * 1024 * 1024 bytes）
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: '文件过大',
          description: `${file.name} 超过50MB限制，当前大小：${formatFileSize(file.size)}`,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    });

    const newImages: ImageFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      rotation: 0
    }));

    setImages(prev => [...prev, ...newImages]);
    
    if (validFiles.length > 0) {
      toast({
        title: '图片添加成功',
        description: `已添加 ${validFiles.length} 张图片`
      });
    }

    // 清空input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 删除图片
  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // 释放URL对象
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return updated;
    });
  };

  // 移动图片位置
  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return newImages;
    });
  };

  // 旋转图片
  const rotateImage = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id 
        ? { ...img, rotation: (img.rotation + 90) % 360 }
        : img
    ));
  };

  // 清空所有图片
  const clearAllImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    toast({
      title: '已清空',
      description: '所有图片已清空'
    });
  };

  // 生成PDF
  const generatePDF = async () => {
    if (images.length === 0) {
      toast({
        title: '没有图片',
        description: '请先选择要转换的图片',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const imageFile of images) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // 创建图片元素
        const img = new Image();
        img.src = imageFile.url;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              // 获取PDF页面尺寸
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();

              // 计算图片尺寸，保持比例
              let imgWidth = img.width;
              let imgHeight = img.height;

              // 根据旋转角度调整尺寸
              if (imageFile.rotation === 90 || imageFile.rotation === 270) {
                [imgWidth, imgHeight] = [imgHeight, imgWidth];
              }

              const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
              const finalWidth = imgWidth * ratio;
              const finalHeight = imgHeight * ratio;

              // 居中位置
              const x = (pageWidth - finalWidth) / 2;
              const y = (pageHeight - finalHeight) / 2;

              // 添加图片到PDF
              if (imageFile.rotation !== 0) {
                // 如果有旋转，需要特殊处理
                pdf.saveGraphicsState();
                const centerX = pageWidth / 2;
                const centerY = pageHeight / 2;
                pdf.setGState(pdf.GState({ rotation: imageFile.rotation }));
                pdf.addImage(img, 'JPEG', x - centerX, y - centerY, finalWidth, finalHeight);
                pdf.restoreGraphicsState();
              } else {
                pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);
              }

              resolve(void 0);
            } catch (error) {
              reject(error);
            }
          };

          img.onerror = () => {
            reject(new Error(`无法加载图片: ${imageFile.name}`));
          };
        });
      }

      // 下载PDF
      const fileName = `图片转PDF_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
      pdf.save(fileName);

      toast({
        title: '转换成功',
        description: `PDF文件已生成并下载: ${fileName}`
      });

    } catch (error) {
      console.error('PDF生成失败:', error);
      toast({
        title: '转换失败',
        description: 'PDF生成过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>图片转PDF</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            选择多张图片，将它们合并成一个PDF文件。最多支持50张图片，单个文件最大50MB。
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 上传区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">选择图片文件</h3>
                <p className="text-sm text-gray-500 mt-1">
                  支持 JPG、PNG、GIF、WebP 格式，最多50张，单个文件最大50MB
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 50}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  选择图片
                </Button>
                
                {images.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={clearAllImages}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    清空所有
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <Badge variant="secondary">
                  已选择: {images.length}/50
                </Badge>
                {images.length > 0 && (
                  <Badge variant="outline">
                    总大小: {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 图片列表 */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">图片预览</h3>
                <Button 
                  onClick={generatePDF}
                  disabled={isGenerating || images.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      生成PDF
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-48 object-cover"
                        style={{
                          transform: `rotate(${image.rotation}deg)`
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium truncate" title={image.name}>
                          {image.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(image.size)}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveImage(image.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveImage(image.id, 'down')}
                              disabled={index === images.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rotateImage(image.id)}
                          >
                            <RotateCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageToPDF;
