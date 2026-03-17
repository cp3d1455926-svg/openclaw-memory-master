# 📢 公众号助手 - API 对接计划

**日期：** 2026-03-18 (Day 2)  
**优先级：** 🔴 高  
**状态：** 准备中

---

## 🎯 目标

实现微信公众号 API 对接，支持：
1. ✅ 自动登录（扫码授权）
2. ✅ 文章素材上传
3. ✅ 草稿箱管理
4. ✅ 定时群发
5. ✅ 数据统计

---

## 📋 准备工作

### 1. 注册微信公众平台

**网址：** https://mp.weixin.qq.com

**需要的信息：**
- [ ] 公众号类型（订阅号/服务号）
- [ ] AppID
- [ ] AppSecret
- [ ] 管理员微信扫码绑定

### 2. 获取 API 凭证

**接口调用凭证 (access_token)**
```
GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
```

**返回示例：**
```json
{
  "access_token": "ACCESS_TOKEN",
  "expires_in": 7200
}
```

### 3. 配置服务器

**需要的配置：**
- [ ] 服务器域名（白名单）
- [ ] IP 地址配置
- [ ] Token 验证
- [ ] EncodingAESKey

---

## 🔧 核心 API

### 1. 获取 access_token

```python
def get_access_token():
    url = "https://api.weixin.qq.com/cgi-bin/token"
    params = {
        "grant_type": "client_credential",
        "appid": APPID,
        "secret": APPSECRET
    }
    response = requests.get(url, params=params)
    return response.json()["access_token"]
```

### 2. 新建草稿

```python
def create_draft(article):
    url = f"https://api.weixin.qq.com/cgi-bin/draft/add?access_token={token}"
    data = {
        "articles": [{
            "title": article["title"],
            "author": article["author"],
            "content": article["content"],
            "content_source_url": "",
            "thumb_media_id": thumb_id,
            "show_cover_pic": 1,
            "need_open_comment": 0,
            "only_fans_can_comment": 0
        }]
    }
    response = requests.post(url, json=data)
    return response.json()
```

### 3. 上传临时素材（图片）

```python
def upload_image(image_path):
    url = f"https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token={token}"
    files = {"media": open(image_path, "rb")}
    response = requests.post(url, files=files)
    return response.json()["url"]
```

### 4. 群发消息

```python
def send_all(filter_tag_id, media_id, msg_type="mpnews"):
    url = f"https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token={token}"
    data = {
        "filter": {"is_to_all": True, "tag_id": filter_tag_id},
        "mpnews": {"media_id": media_id},
        "msgtype": msg_type,
        "send_ignore_reprint": 1
    }
    response = requests.post(url, json=data)
    return response.json()
```

### 5. 定时群发

```python
def schedule_send(media_id, send_time):
    url = f"https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token={token}"
    data = {
        "mpnews": {"media_id": media_id},
        "msgtype": "mpnews",
        "send_ignore_reprint": 1,
        "send_time": send_time  # 格式："2026-03-18 20:00"
    }
    response = requests.post(url, json=data)
    return response.json()
```

---

## 📁 文件结构

```
official-account-assistant/
├── official_account.py          # 主逻辑（已有）
├── wechat_api.py                # 新增：微信 API 封装 ⭐
├── config.json                  # 新增：配置文件 ⭐
├── articles.json                # 文章数据（已有）
├── scripts/
│   ├── remove_ai_flavor.py      # AI 降味（已有）
│   ├── auto_publish.py          # 新增：自动发布 ⭐
│   └── generate_images.py       # 新增：智能配图 ⭐
├── assets/
│   └── templates/               # 排版模板
└── README.md                    # 更新使用说明 ⭐
```

---

## 🔐 配置文件模板

**config.json**
```json
{
  "wechat": {
    "appid": "YOUR_APPID",
    "appsecret": "YOUR_APPSECRET",
    "token": "YOUR_TOKEN",
    "encoding_aes_key": "YOUR_ENCODING_AES_KEY"
  },
  "auto_publish": {
    "default_time": "20:00",
    "auto_thumb": true,
    "auto_comment": false
  },
  "ai_settings": {
    "default_humanize_level": 3,
    "auto_generate_title": true,
    "auto_generate_images": true
  }
}
```

---

## ✅ 开发任务清单

### 阶段 1：基础 API 封装
- [ ] 创建 `wechat_api.py`
- [ ] 实现 `get_access_token()`
- [ ] 实现 `upload_image()`
- [ ] 实现 `create_draft()`
- [ ] Token 自动刷新机制

### 阶段 2：自动发布
- [ ] 创建 `auto_publish.py`
- [ ] 实现定时群发功能
- [ ] 添加发布状态查询
- [ ] 错误处理和重试

### 阶段 3：智能配图
- [ ] 创建 `generate_images.py`
- [ ] 对接 Pollinations AI（已有技能）
- [ ] 自动选择封面图
- [ ] 图片尺寸优化

### 阶段 4：整合测试
- [ ] 更新 `official_account.py` 主逻辑
- [ ] 端到端测试
- [ ] 更新 README 文档
- [ ] 编写使用示例

---

## ⚠️ 注意事项

### API 限制
- access_token 有效期 2 小时，需要自动刷新
- 每天群发次数限制（订阅号 1 次/天，服务号 4 次/月）
- 图片大小限制：< 2MB
- 素材数量限制

### 安全注意
- AppSecret 不要提交到 GitHub
- 使用环境变量或本地配置文件
- 添加 `.gitignore` 排除敏感文件

### 合规注意
- 遵守微信公众平台运营规范
- 避免敏感词和违规内容
- 定时推送需提前审核

---

## 🧪 测试计划

### 测试用例
1. [ ] 获取 access_token 成功
2. [ ] 上传图片成功
3. [ ] 创建草稿成功
4. [ ] 定时群发成功
5. [ ] Token 过期自动刷新
6. [ ] 错误处理正常

### 测试数据
- 测试公众号：待提供
- 测试文章：3-5 篇
- 测试图片：5-10 张

---

## 📚 参考资料

- [微信公众平台开发文档](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html)
- [微信公众号 API 大全](https://mp.weixin.qq.com/wiki)
- [access_token 管理](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)

---

**明日目标：** 完成阶段 1 + 阶段 2，实现基础发布功能！🚀
