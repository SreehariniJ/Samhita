# Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

how should i run this from github in linux terminal

### Planner Response

Let me look at your README and project structure to give you accurate instructions.

*Viewed [README.md](file:///c:/Users/Sreeharini/vision/README.md) *

*Listed directory [vision](file:///c:/Users/Sreeharini/vision) *

### Planner Response

Your README already has great instructions! Here's the concise version for running this from GitHub on a Linux terminal:

### Steps to Run on Linux

```bash
# 1. Clone the repo
git clone https://github.com/SreehariniJ/Vision.git
cd Vision

# 2. Copy the environment config
cp .env.example .env

# 3. (Optional) Edit .env if models are pre-downloaded
#    e.g., change HF_HOME_HOST to /mnt/models
nano .env

# 4. Make the setup script executable and run it (downloads models)
chmod +x setup_gpu_node.sh
./setup_gpu_node.sh

# 5. Start all 16 services
docker compose up -d

# 6. Access the UI at:
#    http://<YOUR_SERVER_IP>:3002
```

### Prerequisites on the Linux machine

- **Git** — to clone the repo
- **Docker** and **Docker Compose** (v2) — to run the containerized services
- **NVIDIA GPU + NVIDIA Container Toolkit** — required for vLLM model serving (the system uses GPU-accelerated inference with Qwen2.5-VL)
- **Sufficient disk space** — the models (7B fp16, 32B 4-bit) are large; expect ~20-30 GB+

### If you don't have a GPU (dev mode)

```bash
git clone https://github.com/SreehariniJ/Vision.git
cd Vision
cp .env.example .env
make dev
# UI at http://localhost:3000
```

This uses [docker-compose.dev.yml](file:///c:/Users/Sreeharini/vision/docker-compose.dev.yml) which runs a mock stack without GPU requirements.

### User Input

how to run it in ide after cloning

### Planner Response

To run and develop the project inside your IDE (such as VS Code or Cursor) after cloning, you should set up a workspace that allows you to run services locally, inspect Python environments, and use debugger configurations.

Here is the step-by-step setup:

### 1. Open the Repository in the IDE
Open your IDE and select **File > Open Folder...** (or run `code .` from your terminal inside the cloned directory) to open the root `Vision` folder.

---

### 2. Set Up Local Python Virtual Environments
Since this project uses multiple containerized services (like `backend`, `services/docling`, `services/ocr`, `services/reranker`, etc.), you should create virtual environments for editing and testing code locally with full autocomplete and linting:

#### Option A: Quick Dev Setup (using `make`)
If you are on Linux/macOS or Git Bash/WSL on Windows, the project has a `Makefile`. You can run:
```bash
make dev
```
This boots up the mock development stack.

#### Option B: Manual Virtual Environment Setup (Windows/PowerShell)
To set up a local Python environment for the `backend` or any service for local execution/linting:
```powershell
# Go to the backend folder
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

In your IDE (e.g. VS Code):
1. Open a Python file (like [backend/app/services/graph_store.py](file:///c:/Users/Sreeharini/vision/backend/app/services/graph_store.py)).
2. Open the Command Palette (`Ctrl+Shift+P`).
3. Select **Python: Select Interpreter**.
4. Choose the interpreter inside the `.venv` you just created (e.g. `backend/.venv/Scripts/python.exe`).

---

### 3. Run the Development Stack inside the IDE Terminal
Instead of running it globally, you can open an integrated terminal (`Ctrl+` ` ` or **Terminal > New Terminal**) and execute the compose command:

* **For Mock/Dev Stack (No GPU needed):**
  ```bash
  docker compose -f docker-compose.dev.yml up
  ```
* **For GPU Stack:**
  ```bash
  docker compose up
  ```

This outputs all logs directly to your IDE terminal window so you can monitor print statements, database connections, and FastAPI endpoints.

---

### 4. Running the End-to-End Tests inside the IDE
You can run the end-to-end tests (like [test_e2e.py](file:///c:/Users/Sreeharini/vision/test_e2e.py)) to verify that your setup is working. 

1. Ensure the development stack is running (Step 3).
2. Open a new terminal in your IDE.
3. Install test dependencies:
   ```bash
   pip install pytest requests
   ```
4. Run the tests:
   ```bash
   pytest test_e2e.py
   ```

### User Input

run it and see whther it is working properly

*User accepted the command `# Go to the backend folder
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
`*

*Viewed [requirements.txt](file:///c:/Users/Sreeharini/vision/backend/requirements.txt) *

*User accepted the command `docker compose -f docker-compose.dev.yml up
`*

*User accepted the command `pip install pytest requests
`*

*User accepted the command `pytest test_e2e.py
`*

*User accepted the command `docker ps`*

*User accepted the command `Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue`*

*User accepted the command `Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe"`*

*User accepted the command `Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"`*

*User accepted the command `Start-Sleep -Seconds 10; docker ps`*

### Planner Response

I've started Docker Desktop on your machine since it wasn't running. 

I am waiting a few seconds for the Docker service to start up completely. Once it is ready, we will be able to start the dev stack and run the tests.

*User accepted the command `Start-Sleep -Seconds 15; docker ps`*

### Planner Response

Docker Desktop is still initializing. I've set another short delay to check if the engine is ready.

*User accepted the command `wsl -l -v`*

*User accepted the command `wsl -d docker-desktop -- echo "started"`*

### Planner Response

Starting the Docker Desktop distribution in WSL manually. Let's wait a moment to see if it responds.

*User accepted the command `docker ps`*

*User accepted the command `Get-Service -Name *docker* -ErrorAction SilentlyContinue`*

*User accepted the command `Start-Service -Name com.docker.service`*

### Planner Response

It looks like Docker Desktop is not running, and starting the background Windows service (`com.docker.service`) requires administrator privileges.

Could you please **manually open/start Docker Desktop** on your computer? 

Once Docker Desktop is fully loaded and showing a green "Engine running" status, let me know, and we will proceed with starting the development stack and running the tests!

### User Input

so if i clone repo in another system how will docker works.what should i do

### Planner Response

If you clone this repository onto another system, Docker is the easiest way to get everything running. However, Docker requires a one-time installation on that system. 

Here is what you need to do depending on the operating system of the target system:

---

### Step 1: Install Docker (One-Time Setup)

#### **On Windows / macOS**
1. Download and install **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.
2. Start Docker Desktop and wait for the engine status to turn **Green (Running)**.
3. *If using Windows:* Ensure WSL 2 (Windows Subsystem for Linux) is installed and enabled in Docker Desktop settings.

#### **On Linux (Ubuntu/Debian)**
Run the following standard commands in your terminal to install Docker and Docker Compose:
```bash
# Update package list and install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine & Compose
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start the docker service
sudo systemctl start docker
sudo systemctl enable docker

# (Optional) Allow running docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

### Step 2: Configure and Run the App

Once Docker is installed and running on the new system, execute the following commands in the cloned directory:

```bash
# 1. Copy the environment variables template
cp .env.example .env

# 2. Run the application
# For local development (Mock stack, no GPU required):
docker compose -f docker-compose.dev.yml up -d

# For GPU-enabled server/workstation:
# First download models:
chmod +x setup_gpu_node.sh && ./setup_gpu_node.sh
# Then start the full stack:
docker compose up -d
```

### Why Docker?
Docker packages all 16 services (databases like Neo4j/Qdrant, workers like Celery/Docling, and the UI) together. Instead of installing Python, Node.js, C++ libraries, MySQL, Redis, and Neo4j manually, Docker downloads ready-to-run containers and connects them automatically.

### User Input

can you all steps from beginning what i have to do after cloning repo in another device through antigravity ide and also linux terminal in gpu and no gpu condition

### Planner Response

Here is the complete, step-by-step guide from scratch. It covers what to do after cloning the repository, split by whether you are using the **Antigravity IDE** or a **Linux Terminal**, and tailored for both **GPU** and **No-GPU (Development)** conditions.

---

# Route A: Using the Linux Terminal

## Case 1: On a Linux GPU Server/Workstation (Production Stack)
Use this if you have an NVIDIA GPU and want to run the full, high-speed multi-modal AI stack.

### 1. Install System Prerequisites
Before running Docker on a GPU machine, you must install the NVIDIA drivers and the NVIDIA Container Toolkit so Docker can access your GPU:
```bash
# 1. Install Docker & Docker Compose (If not installed)
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER && newgrp docker

# 2. Install Nvidia Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list \
  && sudo apt-get update \
  && sudo apt-get install -y nvidia-container-toolkit

# 3. Restart Docker to register the NVIDIA runtime
sudo systemctl restart docker
```

### 2. Run the App
```bash
# 1. Navigate into the cloned repository
cd Vision

# 2. Copy the environment variables template
cp .env.example .env

# 3. Run the fast setup script to download models into cache
chmod +x setup_gpu_node.sh
./setup_gpu_node.sh

# 4. Boot the entire stack in the background
docker compose up -d

# 5. Access the Web Interface in your browser:
# http://<YOUR_LINUX_SERVER_IP>:3002
```

---

## Case 2: On a Linux PC without a GPU (Development Stack)
Use this for simple coding, database testing, and frontend modifications without heavy model inference.

```bash
# 1. Navigate into the cloned repository
cd Vision

# 2. Copy the environment variables template
cp .env.example .env

# 3. Spin up the development/mock containers (bypasses vLLM/GPU requirements)
docker compose -f docker-compose.dev.yml up -d

# 4. Access the Web UI in your browser:
# http://localhost:3000
```

---

# Route B: Inside the Antigravity IDE (or VS Code)

The IDE route is optimized for editing code, installing linters, and running local tests.

## Case 1: On a Windows/Linux PC without a GPU
Use this local configuration inside the IDE to inspect files and test Python scripts locally.

### 1. Start Docker Desktop (Prerequisite)
* **Windows/Mac:** Open the **Docker Desktop** application and make sure the icon in the taskbar is Green (Running).
* **Linux:** Ensure `sudo systemctl status docker` is active.

### 2. Set Up a Local Python Environment inside the IDE
Open your IDE, open the integrated terminal (`Ctrl+` ` `), and run:
```powershell
# 1. Create a virtual environment for the backend service
cd backend
python -m venv .venv

# 2. Activate the virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# 3. Upgrade pip & Install requirements
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure the IDE Interpreter
1. Open any Python file, like [backend/app/services/graph_store.py](file:///c:/Users/Sreeharini/vision/backend/app/services/graph_store.py).
2. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac) to open the Command Palette.
3. Select **Python: Select Interpreter**.
4. Choose the interpreter pointing to your newly created environment: `./backend/.venv/Scripts/python.exe` (or `./backend/.venv/bin/python`).

### 4. Run the Dev Stack in the IDE Terminal
In your IDE terminal, return to the root folder and start the dev containers:
```bash
cd ..
docker compose -f docker-compose.dev.yml up
```
*Leaving out the `-d` flag allows you to view live log outputs from every container directly in your IDE terminal window.*

---

## Case 2: On a GPU-equipped System inside the IDE
Use this to debug GPU issues or modify model loader configurations.

1. Ensure **Docker Desktop** is open (with NVIDIA support checked in settings) or the Docker service is running.
2. In your IDE terminal, run the setup script to pull down weights:
   ```bash
   ./setup_gpu_node.sh
   ```
3. Start the system:
   ```bash
   docker compose up
   ```
4. Configure your Python interpreter pointing to the `backend/.venv` as shown in **Case 1 (Step 3)** to debug FastAPI or database connections.

### User Input

will this requires each system on which it is ran docker.will it only runs in my docker account

### Planner Response

To answer your questions clearly:

### 1. Does every system it is run on require Docker?
**Yes.** Because the application is split into 16 different services (FastAPI backend, frontend, vector databases like Qdrant, Neo4j graph database, Redis, Celery workers, etc.), it is highly complex. Installing all of these manually on a new computer would take hours and often fail due to version conflicts. 

Docker acts like a lightweight container engine. **Every system** that runs this project must have Docker installed so that it can run those 16 services without you having to install them one by one on the host operating system.

---

### 2. Will it only run in your Docker account?
**No, it does NOT require your personal Docker account.**

Anyone who clones this repository on another machine can run it. Here is why:
* **Public Images:** All the images specified in your `docker-compose.yml` (like `redis:7-alpine`, `neo4j:5.19.0`, `qdrant/qdrant:v1.8.2`, and Open WebUI) are **publicly available** on Docker Hub. Anyone can download them without logging into a specific account.
* **Local Builds:** Services that are custom-built (like your `backend`, `reranker`, and `docling` services) are built **locally on that computer** from the `Dockerfile`s when they run `docker compose up`. They don't need to be pushed to or pulled from a private registry.

#### Do they need to log in?
* They **do not** need to sign in or have a Docker account at all.
* They just need to install the free **Docker Desktop** (on Windows/macOS) or **Docker Engine** (on Linux) and run the commands. It will download the public images and build the local components automatically.

### User Input

where has to be downloaded the models in that system?can we download the models in this system and transfer them as like the code

### Planner Response

### 1. Where are the models downloaded by default?

By default, the setup script (`setup_gpu_node.sh`) and the container services download the models into the **Hugging Face Cache directory** on the host machine. 

According to your `.env.example` file, this is mounted to the host's directory:
* **Default Host Path:** `~/.cache/huggingface` (which translates to `C:\Users\<Username>\.cache\huggingface` on Windows or `/home/<username>/.cache/huggingface` on Linux).

---

### 2. Can we download the models on one system and transfer them to another?

**Yes, absolutely!** You can download the models once and transfer them to other machines (via a USB drive, local network share, or external hard drive). This is highly recommended to save bandwidth, especially since models like Qwen2.5-VL are very large.

Here are the two ways to transfer and load them:

#### Option A: Copy the Cache Directory (Simplest)
1. On your current system, locate the cache folder at `~/.cache/huggingface` (or whatever path is set for `HF_HOME_HOST` in your `.env` file).
2. Copy the entire `huggingface` folder to an external drive.
3. On the destination system, copy that folder into the same location: `~/.cache/huggingface`.
4. Run the project. Docker will look in that directory first, find the models, and start immediately without downloading anything from the internet.

#### Option B: Store them in a custom path (e.g., `/mnt/models` or a external folder)
If you want to keep the models in a specific folder on the destination machine (for example, `/mnt/models/hub`):
1. Copy the contents of your `huggingface/hub` folder from the source machine to `/mnt/models/hub` on the target machine.
2. In the target machine's `.env` file, edit the path to point to your custom location:
   ```env
   # Change this line in the target .env file:
   HF_HOME_HOST=/mnt/models
   ```
3. When you run `docker compose up`, Docker will automatically mount `/mnt/models` instead of the default `~/.cache/huggingface`, loading the pre-downloaded models instantly.

### User Input

there is no way to use electronic devices to share the models from this devices to that.can we put the whole project in a tar or zip along with th models and share it through git.or will this also takes time

### Planner Response

Putting the model files into the Git repository is **not recommended** and will likely fail or cause severe issues. Here is why, and what you should do instead:

### 1. Why Git is not suitable for this
* **Strict File Size Limits:** GitHub has a strict file size limit of **100 MB** per file. Large language and vision models are split into tensors that are often 2 GB to 10 GB per file. Even with Git LFS (Large File Storage), GitHub will charge you bandwidth fees and likely block the push due to size.
* **Massive Repository Size:** The total size of the models is **20 GB to 40 GB+**. Checking this into Git will make cloning or pulling the repository incredibly slow, and it can permanently bloat or corrupt your Git history.

---

### 2. Best Alternative: Download via Internet on the Target System
If you cannot use physical devices (like a USB drive or local network cable) to transfer the files, **the best, fastest, and cleanest way** is to let the target system download them directly from Hugging Face over the internet.

When you run `./setup_gpu_node.sh` on the new system, it does not download a single slow ZIP file. Instead:
1. It downloads files **directly from Hugging Face’s high-speed CDN**.
2. It uses **multi-threaded parallel downloads** (via `huggingface-cli`).
3. This is usually much faster than trying to push a 30 GB zip file to GitHub and then cloning it down on the other machine.

---

### 3. How to do it on the target system
When you clone the repository onto the new device, simply run these commands:

```bash
# 1. Clone only the code (very fast, < 5 seconds)
git clone https://github.com/SreehariniJ/Vision.git
cd Vision
cp .env.example .env

# 2. Let the script download the models directly to the local cache
chmod +x setup_gpu_node.sh
./setup_gpu_node.sh
```

The script will fetch the exact, official weights directly to that computer's cache, keeping your Git repository clean and lightweight. (Ensure the target system has a stable internet connection during this step).

### User Input

will this download both the models

*Viewed [setup_gpu_node.sh](file:///c:/Users/Sreeharini/vision/setup_gpu_node.sh) *

*Viewed [download-models.sh](file:///c:/Users/Sreeharini/vision/scripts/download-models.sh) *

### Planner Response

No, by default, the main setup script (`setup_gpu_node.sh`) **only downloads the 7B model (Profile A)**, along with the embedding and reranker models, to save initial bandwidth and setup time.

However, the repository contains a second, more comprehensive downloader script specifically built to download **both models (Profile A 7B and Profile B 32B-AWQ)**:

### How to download both models:
On the target system, instead of running `./setup_gpu_node.sh`, run the script inside the `scripts` directory:

```bash
# Make the full downloader script executable and run it
chmod +x scripts/download-models.sh
./scripts/download-models.sh
```

### What this script will download:
1. **Qwen2.5-VL-7B-Instruct** (~15 GB) — Profile A (Fast inference)
2. **Qwen2.5-VL-32B-Instruct-AWQ** (~20 GB) — Profile B (High-quality vision & reasoning)
3. **BAAI/bge-m3** (~2 GB) — Text/Image Embeddings
4. **BAAI/bge-reranker-v2-m3** (~2 GB) — Search results reranker

*Note: Ensure you have at least **60 GB** of free disk space on the target machine if you decide to download both models!*

### User Input

if i already have the models in the downloads folder where should i place it

### Planner Response

If you already have the models downloaded in your `Downloads` folder, you don't need to re-download them. You can move them to a directory of your choice and configure the project to find them.

Here is the best way to do it on the target system:

### Step 1: Create a permanent folder for the models
Move the models out of the `Downloads` folder into a structured directory (e.g., `C:\models` on Windows, or `/mnt/models` on Linux). 

Inside this directory, they must follow the Hugging Face hub structure:
```text
C:\models/
└── hub/
    ├── models--Qwen--Qwen2.5-VL-7B-Instruct/
    ├── models--Qwen--Qwen2.5-VL-32B-Instruct-AWQ/
    ├── models--BAAI--bge-m3/
    └── models--BAAI--bge-reranker-v2-m3/
```
*(Note: If you downloaded them individually, just put the repo folders inside `hub/` prefixed with `models--` and replacing `/` with `--` as shown above. If you just copied the whole `.cache/huggingface` folder, copy it directly).*

---

### Step 2: Tell the project where the models are
Instead of copying the files into the project repository (which will bloat Git), you just need to edit your `.env` file in the project root:

1. Open `.env` in your IDE.
2. Find the line:
   ```env
   HF_HOME_HOST=~/.cache/huggingface
   ```
3. Change it to point to your new models folder:
   * **For Windows (Docker Desktop):**
     ```env
     HF_HOME_HOST=C:/models
     ```
   * **For Linux:**
     ```env
     HF_HOME_HOST=/mnt/models
     ```

---

### Step 3: Run the project
Now, run:
```bash
docker compose up -d
```
The Docker containers will automatically mount your `C:/models` or `/mnt/models` directory, locate the model files instantly, and launch the application without downloading anything.

### User Input

give me step by step instructions that i have to do from opening github and terminal in linux with no gpu

### Planner Response

Here are the exact step-by-step instructions to run the project from scratch on a new **Linux system with no GPU**, starting right from opening GitHub:

---

### Step 1: Open GitHub and Copy the Clone Link
1. Open your web browser and navigate to your GitHub repository: 
   `https://github.com/SreehariniJ/Vision`
2. Click the green **Code** button on the top right.
3. Under the **Local** tab, click the copy icon next to the URL under HTTPS: 
   `https://github.com/SreehariniJ/Vision.git`

---

### Step 2: Open your Linux Terminal and Install Prerequisites (One-Time Setup)
You need to make sure Docker and Git are installed. In your Linux terminal, run:

```bash
# 1. Update the package list
sudo apt update

# 2. Install Git and Docker
sudo apt install -y git docker.io docker-compose-plugin

# 3. Start the Docker service and set it to run on boot
sudo systemctl start docker
sudo systemctl enable docker

# 4. Add your current user to the docker group so you don't have to type 'sudo' for docker commands
sudo usermod -aG docker $USER

# 5. Apply the group changes immediately
newgrp docker
```

---

### Step 3: Clone the Repository and Navigate to It
In the terminal, run the following commands:

```bash
# 1. Clone the repository using the link from GitHub
git clone https://github.com/SreehariniJ/Vision.git

# 2. Enter the cloned repository folder
cd Vision
```

---

### Step 4: Configure the Environment Variables
Create the `.env` configuration file from the template:

```bash
cp .env.example .env
```

---

### Step 5: Start the Development (No GPU) Stack
Because there is no GPU, run the development compose file which bypasses the heavy GPU model server (vLLM) and loads mock interfaces instead:

```bash
docker compose -f docker-compose.dev.yml up -d
```

---

### Step 6: Access the Web Application
Open your web browser and navigate to:
* **`http://localhost:3000`** (or `http://<YOUR_LINUX_IP>:3000` if accessing the system remotely)

### User Input

for gpu system

### Planner Response

Here are the exact step-by-step instructions to run the project from scratch on a **Linux system WITH a GPU** (an NVIDIA GPU is required for Qwen2.5-VL), starting from opening GitHub:

---

### Step 1: Open GitHub and Copy the Clone Link
1. Open your web browser and navigate to your GitHub repository: 
   `https://github.com/SreehariniJ/Vision`
2. Click the green **Code** button.
3. Under the **Local** tab, copy the HTTPS URL: 
   `https://github.com/SreehariniJ/Vision.git`

---

### Step 2: Open your Linux Terminal and Install Prerequisites (One-Time Setup)
A GPU system requires Docker and the **NVIDIA Container Toolkit** so that the Docker containers can talk to your graphics card.

```bash
# 1. Update the package list
sudo apt update

# 2. Install Git, Docker, and Docker Compose
sudo apt install -y git docker.io docker-compose-plugin
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER && newgrp docker

# 3. Add the NVIDIA Container Toolkit package repositories
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# 4. Install the NVIDIA Container Toolkit
sudo apt update
sudo apt install -y nvidia-container-toolkit

# 5. Restart Docker to apply the NVIDIA GPU configurations
sudo systemctl restart docker
```

---

### Step 3: Clone the Repository and Navigate to It
In the terminal, run:
```bash
# 1. Clone the repository
git clone https://github.com/SreehariniJ/Vision.git

# 2. Go to the project folder
cd Vision
```

---

### Step 4: Configure the Environment Variables
```bash
cp .env.example .env
```
*(Optional)*: If you already have the models downloaded in a custom directory (e.g. `/mnt/models`), open the file using `nano .env` and update `HF_HOME_HOST=/mnt/models`.

---

### Step 5: Download the AI Models
If the models are not already pre-downloaded, run the setup script to download Qwen2.5-VL and the embedding/reranker models directly from Hugging Face:

```bash
# Make the setup script executable and run it
chmod +x setup_gpu_node.sh
./setup_gpu_node.sh
```
*(Alternative)*: If you want to download **both** LLM sizes (7B and 32B-AWQ), run `chmod +x scripts/download-models.sh && ./scripts/download-models.sh` instead.

---

### Step 6: Start the GPU Stack
With your GPU ready and models cached, run the production stack:

```bash
docker compose up -d
```

---

### Step 7: Access the Web Application
Open your web browser and navigate to:
* **`http://localhost:3002`** (or `http://<YOUR_LINUX_SERVER_IP>:3002` if accessing the system remotely)