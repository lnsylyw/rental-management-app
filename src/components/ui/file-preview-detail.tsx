import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Image as ImageIcon,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FilePreviewDetailProps {
  file: {
    original_name: string;
    saved_name: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
  };
  baseUrl: string;
  className?: string;
}

const FilePreviewDetail: React.FC<FilePreviewDetailProps> = ({
  file,
  baseUrl,
  className = ''
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 构建文件URL
  const fileUrl = file.file_path
    ? (file.file_path.startsWith('/') ? `${baseUrl}${file.file_path}` : `${baseUrl}/upload/${file.file_path}`)
    : `${baseUrl}/upload/contracts/${file.saved_name}`;

  // 判断文件类型
  const isPDF = file.file_type === 'pdf' || 
    file.saved_name.toLowerCase().endsWith('.pdf') ||
    file.original_name.toLowerCase().endsWith('.pdf');

  const isImage = file.file_type === 'image' || 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file.saved_name) ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file.original_name);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件类型标识
  const getFileTypeInfo = () => {
    if (isPDF) {
      return {
        icon: <FileText className="h-5 w-5 text-red-600" />,
        bgColor: 'bg-red-100',
        badge: 'PDF',
        badgeVariant: 'destructive' as const
      };
    } else if (isImage) {
      return {
        icon: <ImageIcon className="h-5 w-5 text-blue-600" />,
        bgColor: 'bg-blue-100',
        badge: 'IMG',
        badgeVariant: 'default' as const
      };
    } else {
      return {
        icon: <FileText className="h-5 w-5 text-gray-600" />,
        bgColor: 'bg-gray-100',
        badge: 'FILE',
        badgeVariant: 'secondary' as const
      };
    }
  };

  const fileTypeInfo = getFileTypeInfo();

  // 点击文件框打开预览
  const handleFileClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className={`file-preview-detail ${className}`}>
      <Card 
        className="border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer hover:shadow-md"
        onClick={handleFileClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* 文件图标 */}
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 ${fileTypeInfo.bgColor} rounded-lg flex items-center justify-center`}>
                {fileTypeInfo.icon}
              </div>
            </div>

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant={fileTypeInfo.badgeVariant} className="text-xs">
                  {fileTypeInfo.badge}
                </Badge>
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {file.original_name}
                </h4>
              </div>
              {file.file_size && file.file_size > 0 && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.file_size)}
                </p>
              )}
            </div>

            {/* 预览指示 */}
            <div className="flex-shrink-0">
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 全屏预览对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full h-screen max-w-none m-0 p-0 rounded-none">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-sm truncate">
              <div className="flex items-center space-x-2">
                <Badge variant={fileTypeInfo.badgeVariant} className="text-xs">
                  {fileTypeInfo.badge}
                </Badge>
                <span>{file.original_name}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {isPDF ? (
              <PDFViewerContent
                fileUrl={fileUrl}
                fileName={file.original_name}
              />
            ) : isImage ? (
              <ImageViewerContent
                fileUrl={fileUrl}
                fileName={file.original_name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">无法预览此文件类型</p>
                  <p className="text-sm text-gray-500 mt-2">
                    请下载文件查看内容
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// PDF预览内容组件（专门用于全屏显示）
const PDFViewerContent: React.FC<{ fileUrl: string; fileName: string }> = ({ fileUrl, fileName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0); // 默认100%
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [autoScale, setAutoScale] = useState(false); // 默认不自动缩放
  const [useFallback, setUseFallback] = useState(false);

  // 触控手势状态
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [lastDistance, setLastDistance] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载PDF.js库
  useEffect(() => {
    loadPDFJS();
  }, []);

  const loadPDFJS = async () => {
    try {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          loadPDF();
        };
        document.head.appendChild(script);
      } else {
        loadPDF();
      }
    } catch (error) {
      console.error('加载PDF.js失败:', error);
      setIsLoading(false);
    }
  };

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      const pdfjsLib = (window as any).pdfjsLib;

      if (!pdfjsLib) {
        console.error('PDF.js库未加载');
        setIsLoading(false);
        return;
      }

      console.log('开始加载PDF:', fileUrl);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      console.log('PDF加载成功，总页数:', pdf.numPages);
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);

      renderPage(pdf, 1);
    } catch (error) {
      console.error('加载PDF失败:', error);
      console.error('文件URL:', fileUrl);
      console.log('切换到iframe备用方案');
      setUseFallback(true);
      setIsLoading(false);
    }
  };

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      let currentScale = scale;

      if (autoScale) {
        const viewport = page.getViewport({ scale: 1, rotation: rotation });
        const containerWidth = container.clientWidth - 32;
        const containerHeight = container.clientHeight - 80;

        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        currentScale = Math.min(scaleX, scaleY, 1.0);

        setScale(currentScale);
      }

      const viewport = page.getViewport({
        scale: currentScale,
        rotation: rotation
      });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      setIsLoading(false);
    } catch (error) {
      console.error('渲染页面失败:', error);
      setIsLoading(false);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages && pdfDoc) {
      setCurrentPage(pageNum);
      renderPage(pdfDoc, pageNum);
    }
  };

  const zoomIn = () => {
    setAutoScale(false);
    const newScale = Math.min(scale * 1.2, 3.0);
    setScale(newScale);
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  const zoomOut = () => {
    setAutoScale(false);
    const newScale = Math.max(scale / 1.2, 0.3);
    setScale(newScale);
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  const fitToScreen = () => {
    setAutoScale(true);
    setPanOffset({ x: 0, y: 0 }); // 重置拖拽位置
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  const rotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  // 计算两点间距离（用于双指缩放）
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      // 单指拖拽
      setIsPanning(true);
      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // 双指缩放
      setIsZooming(true);
      setIsPanning(false);
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastDistance(distance);
    }
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isPanning && !isZooming) {
      // 单指拖拽
      const deltaX = e.touches[0].clientX - lastPanPoint.x;
      const deltaY = e.touches[0].clientY - lastPanPoint.y;

      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2 && isZooming) {
      // 双指缩放
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = distance / lastDistance;

      if (Math.abs(scaleChange - 1) > 0.01) { // 避免微小变化
        const newScale = Math.min(Math.max(scale * scaleChange, 0.3), 3.0);
        setScale(newScale);
        setAutoScale(false);
        setLastDistance(distance);

        if (pdfDoc) {
          renderPage(pdfDoc, currentPage);
        }
      }
    }
  };

  // 触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 0) {
      setIsPanning(false);
      setIsZooming(false);
    } else if (e.touches.length === 1 && isZooming) {
      // 从双指变为单指，切换到拖拽模式
      setIsZooming(false);
      setIsPanning(true);
      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  // 如果使用备用方案，显示iframe
  if (useFallback) {
    return (
      <div className="w-full h-full bg-gray-100">
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title={fileName}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100 relative">
      {/* 工具栏 */}
      {!isLoading && pdfDoc && (
        <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs px-1">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={fitToScreen} title="适应屏幕">
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={rotate}>
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* 加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">加载PDF中...</p>
          </div>
        </div>
      )}

      {/* PDF画布 */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden pt-16 p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }} // 禁用默认触控行为
      >
        <div
          className="flex justify-center w-full h-full"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: isPanning || isZooming ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <canvas
            ref={canvasRef}
            className="border border-gray-300 shadow-lg"
            style={{
              maxWidth: 'none',
              maxHeight: 'none',
              cursor: isPanning ? 'grabbing' : 'grab'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 图片预览内容组件（专门用于全屏显示，支持触控手势）
const ImageViewerContent: React.FC<{ fileUrl: string; fileName: string }> = ({ fileUrl, fileName }) => {
  const [scale, setScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [autoFitted, setAutoFitted] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动适配屏幕大小
  const fitToScreen = () => {
    if (!imageRef.current || !containerRef.current) return;

    const image = imageRef.current;
    const container = containerRef.current;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 60; // 减去工具栏高度

    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    if (imageWidth && imageHeight) {
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // 不超过原始大小

      setScale(newScale);
      setPanOffset({ x: 0, y: 0 });
      setAutoFitted(true);
    }
  };

  // 图片加载完成后自动适配
  const handleImageLoad = () => {
    setIsLoading(false);
    if (!autoFitted) {
      setTimeout(fitToScreen, 100); // 延迟一下确保容器尺寸正确
    }
  };

  // 计算两点间距离
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      // 单指拖拽
      setIsPanning(true);
      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // 双指缩放
      setIsZooming(true);
      setIsPanning(false);
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastDistance(distance);
    }
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isPanning && !isZooming) {
      // 单指拖拽
      const deltaX = e.touches[0].clientX - lastPanPoint.x;
      const deltaY = e.touches[0].clientY - lastPanPoint.y;

      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2 && isZooming) {
      // 双指缩放
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = distance / lastDistance;

      setScale(prev => {
        const newScale = prev * scaleChange;
        return Math.max(0.3, Math.min(3, newScale)); // 限制缩放范围
      });

      setLastDistance(distance);
    }
  };

  // 触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 0) {
      setIsPanning(false);
      setIsZooming(false);
    } else if (e.touches.length === 1 && isZooming) {
      // 从双指变为单指，切换到拖拽模式
      setIsZooming(false);
      setIsPanning(true);
      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  // 重置视图（适配屏幕）
  const resetView = () => {
    setAutoFitted(false);
    fitToScreen();
  };

  // 放大
  const zoomIn = () => {
    setScale(prev => Math.min(3, prev * 1.2));
  };

  // 缩小
  const zoomOut = () => {
    setScale(prev => Math.max(0.3, prev / 1.2));
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={resetView}>
          <Maximize2 className="h-4 w-4 mr-1" />
          适应屏幕
        </Button>
      </div>

      {/* 图片显示区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative flex items-center justify-center"
        style={{
          touchAction: 'none',
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">加载中...</p>
            </div>
          </div>
        )}

        <img
          ref={imageRef}
          src={fileUrl}
          alt={fileName}
          className="max-w-none max-h-none object-contain transition-transform duration-200"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transition: isPanning || isZooming ? 'none' : 'transform 0.2s ease-out'
          }}
          onLoad={handleImageLoad}
          onError={() => setIsLoading(false)}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default FilePreviewDetail;
