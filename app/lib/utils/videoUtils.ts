// Placeholder를 실제 iframe으로 변환하는 유틸리티 함수

export const convertPlaceholdersToIframes = (
  htmlContent: string | null | undefined
): string => {
  if (!htmlContent) return htmlContent || '';

  let processedContent = htmlContent;

  // YouTube placeholder를 iframe으로 변환
  processedContent = processedContent.replace(
    /<div class="video-placeholder"[^>]*data-video-type="youtube"[^>]*data-video-id="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    (_match: string, videoId: string) => {
      return `<div class="video-wrapper" style="margin: 10px 0;">
        <iframe width="560" height="315" 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>`;
    }
  );

  // Vimeo placeholder를 iframe으로 변환
  processedContent = processedContent.replace(
    /<div class="video-placeholder"[^>]*data-video-type="vimeo"[^>]*data-video-id="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    (_match: string, videoId: string) => {
      return `<div class="video-wrapper" style="margin: 10px 0;">
        <iframe width="560" height="315" 
          src="https://player.vimeo.com/video/${videoId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; fullscreen; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>`;
    }
  );

  return processedContent;
};

// iframe을 다시 placeholder로 변환하는 유틸리티 함수 (편집 시 사용)
export const convertIframesToPlaceholders = (
  htmlContent: string | null | undefined
): string => {
  if (!htmlContent) return htmlContent || '';

  let processedContent = htmlContent;

  // YouTube iframe을 placeholder로 변환
  processedContent = processedContent.replace(
    /<div class="video-wrapper"[^>]*>[\s\S]*?<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)"[^>]*>[\s\S]*?<\/iframe>[\s\S]*?<\/div>/g,
    (_match: string, videoId: string) => {
      return `<div class="video-placeholder" data-video-type="youtube" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
        <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
        <div style="font-weight: bold;">YouTube Video</div>
        <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
        <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
      </div>`;
    }
  );

  // Vimeo iframe을 placeholder로 변환
  processedContent = processedContent.replace(
    /<div class="video-wrapper"[^>]*>[\s\S]*?<iframe[^>]*src="https:\/\/player\.vimeo\.com\/video\/(\d+)"[^>]*>[\s\S]*?<\/iframe>[\s\S]*?<\/div>/g,
    (_match: string, videoId: string) => {
      return `<div class="video-placeholder" data-video-type="vimeo" data-video-id="${videoId}" contenteditable="false" style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; cursor: pointer;">
        <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
        <div style="font-weight: bold;">Vimeo Video</div>
        <div style="font-size: 12px; color: #666; margin-top: 5px;">ID: ${videoId}</div>
        <div style="font-size: 11px; color: #999; margin-top: 5px;">(저장 시 영상으로 변환됩니다)</div>
      </div>`;
    }
  );

  return processedContent;
};
