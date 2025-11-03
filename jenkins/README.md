# Jenkins CI/CD Setup Guide

## 📋 Tổng Quan

Jenkins CI/CD cho dự án **Ứng Dụng Xem Phim** tự động hóa:
- ✅ Build & Test Backend (.NET 8)
- ✅ Build & Test Frontend (React Native/Expo)
- ✅ Docker image building & pushing
- ✅ Auto-deploy lên Dev/Production

---

## 🚀 Bước 1: Khởi động Jenkins

### 1.1. Tạo file `.env` cho Jenkins

Tạo file `.jenkins.env` trong thư mục gốc:

```bash
# Jenkins Admin
JENKINS_ADMIN_PASSWORD=your_secure_password_here

# GitHub Credentials
GITHUB_USERNAME=TranHoang2k40525
GITHUB_TOKEN=your_github_personal_access_token

# Docker Hub (optional - nếu muốn push images)
DOCKER_HUB_TOKEN=your_docker_hub_token

# Slack (optional - nếu muốn notifications)
SLACK_TEAM_DOMAIN=your-team
SLACK_TOKEN=your_slack_bot_token
```

### 1.2. Khởi động Jenkins container

```powershell
# Tạo network nếu chưa có
docker network create ungdungxemphim-network

# Khởi động Jenkins
docker compose -f docker-compose.jenkins.yml up -d

# Xem logs
docker compose -f docker-compose.jenkins.yml logs -f jenkins
```

### 1.3. Truy cập Jenkins Web UI

1. Mở trình duyệt: **http://localhost:8080**
2. Đợi 1-2 phút để Jenkins khởi động hoàn tất

---

## 🔐 Bước 2: Setup Initial Admin Password

### Cách 1: Dùng password đã cấu hình trong `.jenkins.env`

```
Username: admin
Password: your_secure_password_here
```

### Cách 2: Lấy từ container (nếu không dùng JCasC)

```powershell
docker exec ungdungxemphim-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 🔧 Bước 3: Cấu hình Jenkins

### 3.1. Install Suggested Plugins

Các plugins đã được tự động cài từ `jenkins/plugins.txt`:
- ✅ Git & GitHub integration
- ✅ Docker Workflow
- ✅ Pipeline plugins
- ✅ JUnit & test reporting
- ✅ Configuration as Code (JCasC)

### 3.2. Cài thêm Docker trong Jenkins Container (nếu cần)

```powershell
# Vào container
docker exec -it -u root ungdungxemphim-jenkins bash

# Cài Docker CLI
apt-get update
apt-get install -y docker.io

# Kiểm tra Docker
docker --version
exit
```

### 3.3. Cài thêm .NET SDK trong Jenkins (cho build local)

```powershell
docker exec -it -u root ungdungxemphim-jenkins bash

# Cài .NET 8 SDK
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0

# Add to PATH
export PATH="$HOME/.dotnet:$PATH"
dotnet --version
exit
```

---

## 📦 Bước 4: Tạo Jenkins Jobs

### 4.1. Multibranch Pipeline cho Backend

1. **Dashboard** → **New Item**
2. **Item name**: `ungdungxemphim-backend`
3. **Type**: **Multibranch Pipeline**
4. **Branch Sources**:
   - Repository URL: `https://github.com/TranHoang2k40525/Ungdungxemphim.git`
   - Credentials: Select `github-credentials`
5. **Build Configuration**:
   - Mode: **by Jenkinsfile**
   - Script Path: `Backend/UngDungXemPhim.API/Jenkinsfile`
6. **Scan Multibranch Pipeline Triggers**:
   - ✅ Periodically if not otherwise run
   - Interval: **1 hour**
7. **Save**

### 4.2. Multibranch Pipeline cho Frontend

Tương tự như Backend nhưng:
- **Item name**: `ungdungxemphim-frontend`
- **Script Path**: `Fontend/UngDungXemPhimApp/Jenkinsfile`

---

## 🔗 Bước 5: Cấu hình GitHub Webhooks (Auto-trigger builds)

### 5.1. Tạo GitHub Personal Access Token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token**:
   - ✅ `repo` (Full control)
   - ✅ `admin:repo_hook` (webhooks)
3. Copy token → Dùng làm `GITHUB_TOKEN` trong `.jenkins.env`

### 5.2. Cấu hình Webhook trên GitHub Repository

1. Repository → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `http://YOUR_SERVER_IP:8080/github-webhook/`
3. **Content type**: `application/json`
4. **Events**: 
   - ✅ Push events
   - ✅ Pull request events
5. **Save**

---

## 🎯 Bước 6: Test Pipeline

### 6.1. Manual Trigger

1. **Dashboard** → **ungdungxemphim-backend** → **main branch** → **Build Now**
2. Xem **Console Output** để theo dõi build process

### 6.2. Auto-trigger bằng Git Push

```powershell
# Make a small change
git add .
git commit -m "Test Jenkins CI/CD"
git push origin main

# Jenkins sẽ tự động detect và build
```

---

## 📊 Pipeline Stages

### Backend Pipeline (Jenkinsfile)

```
📋 Checkout → 🔧 Restore → 🏗️ Build → 🧪 Test → 🔍 Analysis → 🐳 Docker Build → 📤 Push → 🚀 Deploy → ✅ Health Check
```

**Stages chi tiết:**
1. **Checkout**: Clone code từ GitHub
2. **Restore Dependencies**: `dotnet restore`
3. **Build**: `dotnet build --configuration Release/Debug`
4. **Test**: `dotnet test` với code coverage
5. **Code Analysis**: `dotnet format --verify-no-changes`
6. **Docker Build**: Build Docker image từ `Dockerfile.prod`
7. **Push to Registry**: Push lên Docker Hub (nếu có credentials)
8. **Deploy**: 
   - `develop` branch → Auto-deploy to **Dev**
   - `main` branch → Manual approval → Deploy to **Production**
9. **Health Check**: Test endpoint `/health`

### Frontend Pipeline (Jenkinsfile)

```
📋 Checkout → 📦 Install → 🧹 Lint → 🧪 Test → 🏗️ Build Web → 📱 Build APK → 🐳 Docker → 📤 Push → 🚀 Deploy → ✅ Check
```

**Stages chi tiết:**
1. **Checkout**: Clone code
2. **Install Dependencies**: `npm ci`
3. **Lint**: `npm run lint` (ESLint)
4. **Test**: `npm test` (nếu có tests)
5. **Build Expo Web**: `npx expo export --platform web`
6. **Build APK**: EAS Build cho Android (nếu có `eas.json`)
7. **Docker Build**: Build Metro Bundler container
8. **Push to Registry**: Push Docker image
9. **Deploy**: Auto-deploy Dev / Manual Production
10. **Health Check**: Test Metro Bundler port 8081

---

## 🔒 Bước 7: Security Best Practices

### 7.1. Jenkins Security

1. **Manage Jenkins** → **Configure Global Security**
2. **Authorization**: Matrix-based security
3. **CSRF Protection**: Enable (đã enable trong `casc.yaml`)

### 7.2. Credentials Management

Tất cả secrets được quản lý qua **Jenkins Credentials**:

```powershell
# View credentials
Dashboard → Manage Jenkins → Manage Credentials
```

**Credentials cần thiết:**
- ✅ `github-credentials`: Username + Password/Token
- ✅ `docker-hub-token`: Secret text (Docker Hub token)
- ✅ `slack-token`: Secret text (optional)

### 7.3. Không commit secrets vào Git

❌ **KHÔNG BAO GIỜ commit:**
- `.jenkins.env`
- GitHub tokens
- Docker Hub tokens
- Database passwords

✅ **Thêm vào `.gitignore`:**
```
.jenkins.env
jenkins-data/
```

---

## 📈 Monitoring & Notifications

### 8.1. View Build Status

```
Dashboard → ungdungxemphim-backend → main
```

- ✅ **Blue ball**: Build thành công
- ❌ **Red ball**: Build thất bại
- ⚪ **Gray ball**: Chưa build
- 🔵 **Blue ball blinking**: Đang build

### 8.2. Email Notifications (Optional)

**Manage Jenkins** → **Configure System** → **E-mail Notification**:
```
SMTP server: smtp.gmail.com
Port: 587
Use TLS: Yes
Username: your-email@gmail.com
Password: your-app-password
```

### 8.3. Slack Notifications (Optional)

Thêm vào Jenkinsfile:
```groovy
post {
    success {
        slackSend(
            color: 'good', 
            message: "✅ Build #${env.BUILD_NUMBER} succeeded\n${env.BUILD_URL}"
        )
    }
    failure {
        slackSend(
            color: 'danger', 
            message: "❌ Build #${env.BUILD_NUMBER} failed\n${env.BUILD_URL}"
        )
    }
}
```

---

## 🛠️ Troubleshooting

### Problem 1: Jenkins không start

```powershell
# Check logs
docker compose -f docker-compose.jenkins.yml logs jenkins

# Check container status
docker ps -a | findstr jenkins

# Restart
docker compose -f docker-compose.jenkins.yml restart jenkins
```

### Problem 2: Docker command not found trong Jenkins

```powershell
# Kiểm tra Docker socket mount
docker inspect ungdungxemphim-jenkins | findstr "/var/run/docker.sock"

# Vào container và test
docker exec -it ungdungxemphim-jenkins docker ps
```

### Problem 3: Permission denied khi build Docker

```powershell
# Thêm jenkins user vào docker group (inside container)
docker exec -it -u root ungdungxemphim-jenkins bash
usermod -aG docker jenkins
exit

# Restart container
docker compose -f docker-compose.jenkins.yml restart jenkins
```

### Problem 4: GitHub webhook không trigger build

1. **Check webhook delivery** trên GitHub:
   - Repository → Settings → Webhooks → Recent Deliveries
2. **Check Jenkins GitHub plugin**:
   - Manage Jenkins → Configure System → GitHub → Test connection
3. **Firewall**: Đảm bảo port 8080 accessible từ internet

### Problem 5: .NET build fails

```powershell
# Cài .NET SDK trong Jenkins container
docker exec -it -u root ungdungxemphim-jenkins bash
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0
```

---

## 📚 Useful Commands

### Jenkins Management

```powershell
# Start Jenkins
docker compose -f docker-compose.jenkins.yml up -d

# Stop Jenkins
docker compose -f docker-compose.jenkins.yml down

# View logs
docker compose -f docker-compose.jenkins.yml logs -f jenkins

# Backup Jenkins data
docker run --rm -v ungdungxemphim_jenkins-data:/data -v ${PWD}:/backup alpine tar czf /backup/jenkins-backup.tar.gz /data

# Restore Jenkins data
docker run --rm -v ungdungxemphim_jenkins-data:/data -v ${PWD}:/backup alpine tar xzf /backup/jenkins-backup.tar.gz -C /
```

### Pipeline Testing

```powershell
# Trigger backend build manually
curl -X POST http://localhost:8080/job/ungdungxemphim-backend/job/main/build --user admin:your_password

# Check build status
curl http://localhost:8080/job/ungdungxemphim-backend/job/main/lastBuild/api/json --user admin:your_password
```

---

## 🎓 Next Steps

1. ✅ **Hoàn tất setup Jenkins** theo hướng dẫn trên
2. ✅ **Test build Backend** với `main` branch
3. ✅ **Test build Frontend** với `main` branch
4. ✅ **Cấu hình GitHub webhooks** cho auto-trigger
5. ✅ **Setup notifications** (Email/Slack)
6. 🔄 **Monitor builds** và optimize pipeline theo nhu cầu

---

## 📞 Support

- **Jenkins Documentation**: https://www.jenkins.io/doc/
- **Pipeline Syntax**: https://www.jenkins.io/doc/book/pipeline/syntax/
- **Docker Plugin**: https://plugins.jenkins.io/docker-workflow/

---

## 📝 Notes

- Jenkins data được persist trong Docker volume `ungdungxemphim_jenkins-data`
- Jenkinsfile có thể customize theo nhu cầu dự án
- Production deployment yêu cầu manual approval để tránh deploy nhầm
- Backup Jenkins data thường xuyên bằng lệnh trên

**🎉 Jenkins CI/CD đã sẵn sàng cho dự án Ứng Dụng Xem Phim!**
