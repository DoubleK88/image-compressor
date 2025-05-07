// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const compressionControls = document.getElementById('compressionControls');
const previewSection = document.getElementById('previewSection');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片
let currentFile = null;

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理文件上传
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    originalSize.textContent = formatFileSize(file.size);

    // 显示原始图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        compressionControls.style.display = 'block';
        previewSection.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// 拖放处理
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007AFF';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#d2d2d7';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#d2d2d7';
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

// 点击上传
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

// 质量滑块事件
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value + '%';
});

// 压缩图片
async function compressImage(file, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 保持原始宽高比
                canvas.width = img.width;
                canvas.height = img.height;

                // 绘制图片
                ctx.drawImage(img, 0, 0);

                // 压缩
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', quality / 100);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// 压缩按钮点击事件
compressBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    const quality = qualitySlider.value;
    const compressedBlob = await compressImage(currentFile, quality);
    
    // 显示压缩后的图片
    compressedPreview.src = URL.createObjectURL(compressedBlob);
    compressedSize.textContent = formatFileSize(compressedBlob.size);
    
    // 显示下载按钮
    downloadBtn.style.display = 'block';
    
    // 设置下载链接
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        link.download = `compressed_${currentFile.name}`;
        link.click();
    };
}); 