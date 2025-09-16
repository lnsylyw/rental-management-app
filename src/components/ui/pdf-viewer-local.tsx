import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  ExternalLink,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PDFViewerLocalProps {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  className?: string;
  showPreview?: boolean;
  showDownload?: boolean; // 是否显示下载按钮
  showOpenExternal?: boolean; // 是否显示在新窗口打开按钮
}

const PDFViewerLocal: React.FC<PDFViewerLocalProps> = ({
  fileUrl,
  fileName,
  fileSize,
  className = '',
  showPreview = true,
  showDownload = true,
  showOpenExternal = true
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0); // 默认100%
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [autoScale, setAutoScale] = useState(false); // 默认不自动缩放
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 下载文件
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 在新窗口中打开PDF
  const handleOpenPDF = () => {
    window.open(fileUrl, '_blank');
  };

  // 加载PDF.js库
  useEffect(() => {
    if (isDialogOpen) {
      loadPDFJS();
    }
  }, [isDialogOpen]);

  const loadPDFJS = async () => {
    try {
      // 动态加载PDF.js
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
      
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      renderPage(pdf, 1);
    } catch (error) {
      console.error('加载PDF失败:', error);
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

      // 如果启用自动缩放，计算适合容器的缩放比例
      if (autoScale) {
        const viewport = page.getViewport({ scale: 1, rotation: rotation });
        const containerWidth = container.clientWidth - 32; // 减去padding
        const containerHeight = container.clientHeight - 80; // 减去工具栏高度

        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        currentScale = Math.min(scaleX, scaleY, 1.0); // 不超过100%

        setScale(currentScale);
      }

      // 计算视口
      const viewport = page.getViewport({
        scale: currentScale,
        rotation: rotation
      });

      // 设置canvas尺寸
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // 渲染页面
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

  // 页面导航
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages && pdfDoc) {
      setCurrentPage(pageNum);
      renderPage(pdfDoc, pageNum);
    }
  };

  // 缩放控制
  const zoomIn = () => {
    setAutoScale(false); // 手动缩放时禁用自动缩放
    const newScale = Math.min(scale * 1.2, 3.0);
    setScale(newScale);
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  const zoomOut = () => {
    setAutoScale(false); // 手动缩放时禁用自动缩放
    const newScale = Math.max(scale / 1.2, 0.3);
    setScale(newScale);
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  // 适应屏幕
  const fitToScreen = () => {
    setAutoScale(true);
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  // 旋转控制
  const rotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  };

  return (
    <div className={`pdf-viewer-local ${className}`}>
      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* PDF图标 */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
            </div>

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {fileName}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  PDF
                </Badge>
              </div>
              {fileSize && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(fileSize)}
                </p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-2">
              {showPreview && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      预览
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full h-[90vh] max-w-none mx-2">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between text-sm">
                        <span className="truncate">{fileName}</span>
                        <div className="flex items-center space-x-1">
                          {showDownload && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownload}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {showOpenExternal && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleOpenPDF}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* PDF预览区域 */}
                    <div className="flex-1 overflow-hidden bg-gray-100 rounded-lg relative">
                      {/* 工具栏 */}
                      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm">
                            {currentPage} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomOut}
                          >
                            <ZoomOut className="h-3 w-3" />
                          </Button>
                          <span className="text-xs px-1">{Math.round(scale * 100)}%</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomIn}
                          >
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fitToScreen}
                            title="适应屏幕"
                          >
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={rotate}
                          >
                            <RotateCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* 加载指示器 */}
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">加载中...</p>
                          </div>
                        </div>
                      )}

                      {/* PDF画布 */}
                      <div
                        ref={containerRef}
                        className="w-full h-full overflow-auto pt-16 p-4"
                      >
                        <div className="flex justify-center">
                          <canvas
                            ref={canvasRef}
                            className="border border-gray-300 shadow-lg max-w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {showDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  title="下载文件"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFViewerLocal;
