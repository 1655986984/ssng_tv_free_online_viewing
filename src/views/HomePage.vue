<template>
    <div class="home-page">
      <!-- 顶部图片容器 -->
      <div class="top-image-container">
        <img src="../assets/bg.png" alt="Top Banner" class="top-image" />
      </div>
  
      <!-- 其他页面内容可以放在这里 -->
      <!-- <WeatherDisplay /> -->
  
      <!-- 底部信息 -->
      <footer class="page-footer">
        <p>网站已运行 {{ runningTime }} <span class="heartbeat">❤️</span></p>
        <p>今年的余额还剩下 {{ remainingTime }} <span class="heartbeat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6M12 16v6M20 8l-8 8-8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></p>
        <p>Copyright &copy; 2025-至今 <a target="_blank" href="https://www.nanshuo.icu" style="color: var(--theme-color);text-decoration: none;">南烁</a>. All Rights Reserved.</p>
        <p class="copyright-notice">注：本站的所有资源均来源于网络公开的资源，若有侵权，请联系网站所有者删除，本站不承担任何法律责任</p>
        <!-- <p>作者: 南烁</p> -->
      </footer>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  // import WeatherDisplay from '@/components/WeatherDisplay.vue'; // 如果需要天气组件，取消注释
  
  const runningTime = ref('');
    const remainingTime = ref('');
  const startTime = new Date('2025-04-21T00:00:00'); // 网站启动时间
  let timer = null;
  
  const updateRemainingTime = () => {
      const now = new Date();
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      const diff = endOfYear.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      remainingTime.value = `${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`;
    };

    const updateRunningTime = () => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
  
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
    runningTime.value = `${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`;
  };
  
  onMounted(() => {
    updateRunningTime();
      updateRemainingTime();
    timer = setInterval(updateRunningTime, 1000);
      remainingTimer = setInterval(updateRemainingTime, 1000);
  });
  
  let remainingTimer = null;

    onUnmounted(() => {
    if (remainingTimer) {
        clearInterval(remainingTimer);
      }
      if (timer) {
      clearInterval(timer);
    }
  });
  </script>
  
  <style scoped>
  /* 心跳动画 */
.heartbeat {
  display: inline-block;
  animation: heartbeat 1s infinite;
  transform-origin: center;
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

  .home-page {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - var(--topbar-height) - 40px); /* 减去顶部导航和padding */
    width: 100%;
    position: relative;
  }
  
  .top-image-container {
    flex: 1;
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .top-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .page-footer {
    width: 100%;
    position: relative;
    z-index: 2;
    padding: 20px 0;
    padding-bottom: 0px;
    text-align: center;
    background-color: var(--card-background);
    color: var(--text-color-light);
    border-top: 1px solid var(--border-color);
    font-size: 14px;
    line-height: 1.6;
    margin-top: 0;
  }
  
  .page-footer p {
    margin-bottom: 5px;
  }
  
  .copyright-notice {
    font-size: 12px;
    color: var(--text-color-lighter);
    max-width: 800px;
    margin: 5px auto;
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .page-footer {
      font-size: 12px;
      padding: 15px 0;
    }
  }
  </style>