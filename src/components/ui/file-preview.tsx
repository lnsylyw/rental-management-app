import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  ExternalLink, 
  Eye,
  X
} from 'lucide-react';
import PDFViewerLocal from './pdf-viewer-local';

interface FilePreviewProps {
  file: {
    original_name: string;
    saved_name: string;
    file_path: string;
    file_size: number;
    file_type?: string;
  };
  baseUrl: string;
  onDelete?: (filename: string) => void;
  showDelete?: boolean;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  baseUrl,
  onDelete,
  showDelete = false,
  className = ''
}) => {
  const fileUrl = `${baseUrl}/static/${file.file_path}`;
  const fileExtension = file.original_name?.split('.').pop()?.toLowerCase() || '';
  const isPDF = fileExtension === 'pdf' || file.file_type === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension) || file.file_type === 'image';

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
    link.download = file.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 在新窗口中打开文件
  const handleOpenInNewWindow = () => {
    if (isPDF) {
      window.open(fileUrl, '_blank');
    } else if (isImage) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${file.original_name}</title></head>
            <body style="margin:0;padding:20px;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
              <img src="${fileUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${file.original_name}" />
            </body>
          </html>
        `);
      }
    }
  };

  // 如果是PDF文件，使用本地PDF预览组件
  if (isPDF) {
    return (
      <div className={`relative group ${className}`}>
        <PDFViewerLocal
          fileUrl={fileUrl}
          fileName={file.original_name}
          fileSize={file.file_size}
          showPreview={true}
        />
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(file.saved_name)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 z-10 shadow-lg"
            title="删除文件"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  // 如果是图片文件，显示图片预览
  if (isImage) {
    return (
      <div className={`relative group ${className}`}>
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
          <img
            src={fileUrl}
            alt={file.original_name}
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
            onClick={handleOpenInNewWindow}
            onError={(e) => {
              // 如果图片加载失败，显示占位符
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            }}
          />
        </div>
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(file.saved_name)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="删除文件"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
          {file.original_name}
        </div>
      </div>
    );
  }

  // 其他文件类型的通用预览
  return (
    <div className={`relative group ${className}`}>
      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {file.original_name}
              </h4>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.file_size)}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="下载文件"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(file.saved_name)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 shadow-lg z-10"
          title="删除文件"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default FilePreview;
