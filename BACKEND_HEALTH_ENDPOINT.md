# 后端健康检查端点说明

## 概述

移动端应用需要一个健康检查端点来测试API连接。请在后端添加以下端点：

## 端点规范

### URL
```
GET /health
```

### 响应格式

**成功响应 (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

**失败响应 (503 Service Unavailable):**
```json
{
  "status": "error",
  "message": "Service temporarily unavailable"
}
```

## 实现示例

### FastAPI (Python)
```python
from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }
```

### Express.js (Node.js)
```javascript
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
```

### Django (Python)
```python
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datetime import datetime

@require_http_methods(["GET"])
def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'version': '1.0.0'
    })

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
]
```

### Spring Boot (Java)
```java
@RestController
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("timestamp", Instant.now().toString());
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }
}
```

## CORS 配置

确保健康检查端点允许跨域请求：

### FastAPI
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Express.js
```javascript
const cors = require('cors');
app.use(cors());
```

## 安全考虑

1. **不要暴露敏感信息**：健康检查端点不应返回数据库连接字符串、API密钥等敏感信息

2. **限制访问频率**：考虑添加速率限制，防止滥用

3. **监控访问**：记录健康检查请求，用于监控和调试

## 测试

添加端点后，可以通过以下方式测试：

```bash
# 使用 curl 测试
curl -X GET http://localhost:8000/health

# 使用 wget 测试
wget -qO- http://localhost:8000/health

# 使用浏览器访问
http://localhost:8000/health
```

## 移动端使用

移动端应用会：
1. 在启动时测试多个可能的服务器地址
2. 选择响应最快的可用地址
3. 缓存可用地址供后续使用
4. 定期重新测试连接状态

## 故障排除

如果健康检查失败：
1. 确认端点已正确实现
2. 检查CORS配置
3. 验证防火墙设置
4. 确认服务器绑定到正确的IP地址 (0.0.0.0 而不是 127.0.0.1)
