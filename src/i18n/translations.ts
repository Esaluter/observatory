import { Language } from '../types/dataContract';

export interface Translations {
  appName: string;
  appSubtitle: string;
  loadingText: string;
  loadErrorTitle: string;
  loadErrorRetry: string;
  refreshNotice: string;
  nav: {
    earth: string;
    stories: string;
    archive: string;
    about: string;
  };
  earth: {
    kicker: string;
    title: string;
    subtitle: string;
    latestObservationBadge: (dateLabel: string) => string;
    selectedObservationBadge: (dateLabel: string) => string;
    naturalLabel: string;
    enhancedLabel: string;
    naturalHint: string;
    enhancedHint: string;
    playLabel: string;
    pauseLabel: string;
    prevFrame: string;
    nextFrame: string;
    speedLabel: string;
    frameCounter: (current: number, total: number) => string;
    dateStripLabel: string;
    framesShort: (count: number) => string;
    expandView: string;
    detailsToggle: string;
    centroidLabel: string;
    dscovrDistanceLabel: string;
    sunDistanceLabel: string;
    lunarDistanceLabel: string;
    captureTimeLabel: string;
    attributionLabel: string;
    sourceLinkLabel: string;
    earthAlt: (collection: string, date: string, time: string | null) => string;
    fallbackTitle: string;
    fallbackDesc: string;
    errorTitle: string;
    retryBtn: string;
  };
  stories: {
    kicker: string;
    title: string;
    subtitle: string;
    readStoryBtn: string;
    watchVideoBtn: string;
    openSourceBtn: string;
    authorLabel: string;
    needsExplanationRu: string;
    needsExplanationEn: string;
    factSourcesLabel: string;
    aiExplanationLabel: string;
    videoLabel: string;
    errorTitle: string;
    retryBtn: string;
    emptyTitle: string;
    emptyDesc: string;
  };
  archive: {
    kicker: string;
    title: string;
    subtitle: string;
    tabEpic: string;
    tabApod: string;
    tabLibrary: string;
    searchPlaceholder: string;
    epicSeriesFrames: (count: number) => string;
    epicSeriesOpenBtn: string;
    epicSeriesRange: (start: string, end: string) => string;
    epicBothModes: string;
    libraryTitle: string;
    libraryDesc: string;
    libraryBadge: string;
    noMatches: string;
    resetSearch: string;
    retryBtn: string;
    sourceError: string;
  };
  modal: {
    close: string;
    prev: string;
    next: string;
    dateLabel: string;
    timeLabel: string;
    authorLabel: string;
    sourceBtn: (source: string) => string;
    videoFallbackDesc: string;
    mediaFallbackTitle: string;
    mediaFallbackDesc: string;
    epicDetailsToggle: string;
    storySectionTitle: string;
    factSourcesLabel: string;
  };
  footer: {
    aboutTitle: string;
    aboutText: string;
    sourcesTitle: string;
    sourcesText: string;
    epicPortalLink: string;
    apodPortalLink: string;
    copyrightLine: string;
    backToTop: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    appName: 'ЕНОТКОРП — NASA Observatory',
    appSubtitle: 'Окно во Вселенную',
    loadingText: 'Открываем окно во Вселенную...',
    loadErrorTitle: 'Не удалось загрузить наблюдения',
    loadErrorRetry: 'Попробовать снова',
    refreshNotice: 'Показана последняя загруженная серия наблюдений.',
    nav: {
      earth: 'Земля из космоса',
      stories: 'Истории космоса',
      archive: 'Архив',
      about: 'О проекте'
    },
    earth: {
      kicker: 'Наблюдение Земли · DSCOVR EPIC',
      title: 'Земля из космоса',
      subtitle: 'Полный освещённый диск нашей планеты с расстояния около 1,5 миллиона километров — переключайте кадры, следите за вращением Земли и выбирайте доступные дни наблюдений.',
      latestObservationBadge: (dateLabel) => `Последнее доступное наблюдение · ${dateLabel}`,
      selectedObservationBadge: (dateLabel) => `Серия наблюдений · ${dateLabel}`,
      naturalLabel: 'Естественные цвета',
      enhancedLabel: 'Усиленные цвета',
      naturalHint: 'Естественные цвета Земли',
      enhancedHint: 'Усиленный контраст атмосферы и суши',
      playLabel: 'Воспроизвести',
      pauseLabel: 'Пауза',
      prevFrame: 'Предыдущий кадр',
      nextFrame: 'Следующий кадр',
      speedLabel: 'Скорость',
      frameCounter: (current, total) => `Кадр ${current} из ${total}`,
      dateStripLabel: 'Доступные дни наблюдений',
      framesShort: (count) => `${count} кадр.`,
      expandView: 'Открыть крупнее',
      detailsToggle: 'Научные параметры наблюдения',
      centroidLabel: 'Подспутниковая точка Земли',
      dscovrDistanceLabel: 'Расстояние до аппарата DSCOVR',
      sunDistanceLabel: 'Расстояние до Солнца',
      lunarDistanceLabel: 'Расстояние до Луны',
      captureTimeLabel: 'Время съёмки',
      attributionLabel: 'Источник снимков',
      sourceLinkLabel: 'Портал NASA EPIC',
      earthAlt: (collection, date, time) => {
        const modeLabel = collection === 'enhanced' ? 'Усиленные цвета' : 'Естественные цвета';
        return `Земля из космоса (${modeLabel}), ${date}${time ? `, ${time}` : ''}`;
      },
      fallbackTitle: 'Изображение временно недоступно',
      fallbackDesc: 'Вы можете открыть серию наблюдений напрямую на официальном портале NASA EPIC.',
      errorTitle: 'Не удалось загрузить наблюдения Земли',
      retryBtn: 'Повторить загрузку'
    },
    stories: {
      kicker: 'Астрономическая картина дня · APOD',
      title: 'Истории космоса',
      subtitle: 'Отобранные астрономические фотографии, видео и научные наблюдения с указанием авторства и ссылками на первоисточник.',
      readStoryBtn: 'Открыть историю',
      watchVideoBtn: 'Смотреть видео',
      openSourceBtn: 'Первоисточник NASA',
      authorLabel: 'Авторство',
      needsExplanationRu:
        'Подробное научно-популярное объяснение на русском языке готовится к публикации. Сейчас вы можете ознакомиться с оригинальным материалом на сайте NASA.',
      needsExplanationEn:
        'A curated popular-science explanation is being prepared. You can read the original NASA publication directly.',
      factSourcesLabel: 'Научные источники',
      aiExplanationLabel: 'Научно-популярное объяснение',
      videoLabel: 'Видео',
      errorTitle: 'Не удалось загрузить космические истории',
      retryBtn: 'Повторить загрузку',
      emptyTitle: 'Пока нет доступных публикаций',
      emptyDesc: 'Новые научно-популярные истории появятся в следующих обновлениях обсерватории.'
    },
    archive: {
      kicker: 'Исследование наблюдений',
      title: 'Архив обсерватории',
      subtitle: 'Серии наблюдений Земли по датам, избранные истории космоса и будущие научные разделы.',
      tabEpic: 'Серии Земли (EPIC)',
      tabApod: 'Истории космоса (APOD)',
      tabLibrary: 'NASA Library',
      searchPlaceholder: 'Поиск по названию, дате или авторству...',
      epicSeriesFrames: (count) => `${count} снимков вращения Земли`,
      epicSeriesOpenBtn: 'Открыть в наблюдателе',
      epicSeriesRange: (start, end) => `${start} — ${end}`,
      epicBothModes: 'Естественные и усиленные цвета',
      libraryTitle: 'NASA Image & Video Library — будущее направление',
      libraryDesc:
        'Раздел подготовлен для исторических и современных коллекций миссий NASA. Как только проверенные материалы будут добавлены в архив, они появятся здесь автоматически.',
      libraryBadge: 'Будущее направление',
      noMatches: 'По вашему запросу ничего не найдено',
      resetSearch: 'Сбросить поиск',
      retryBtn: 'Повторить загрузку',
      sourceError: 'Не удалось загрузить этот раздел архива'
    },
    modal: {
      close: 'Закрыть окно',
      prev: 'Предыдущий материал',
      next: 'Следующий материал',
      dateLabel: 'Дата',
      timeLabel: 'Время (UTC)',
      authorLabel: 'Авторство',
      sourceBtn: (source) =>
        source === 'epic'
          ? 'Открыть на NASA EPIC'
          : source === 'library'
            ? 'Открыть в NASA Library'
            : 'Открыть на NASA APOD',
      videoFallbackDesc: 'Если видео не воспроизводится в браузере, откройте его на официальном сайте NASA.',
      mediaFallbackTitle: 'Изображение временно недоступно',
      mediaFallbackDesc: 'Откройте материал напрямую на официальном сайте NASA по ссылке ниже.',
      epicDetailsToggle: 'Научные параметры наблюдения',
      storySectionTitle: 'О наблюдении',
      factSourcesLabel: 'Источники'
    },
    footer: {
      aboutTitle: 'Независимая любительская обсерватория',
      aboutText:
        '«Окно во Вселенную» — независимый научно-образовательный проект ЕНОТКОРП (RACCOONCORP). Сайт не связан с NASA и не является официальным продуктом агентства.',
      sourcesTitle: 'Открытые научные источники',
      sourcesText:
        'Все наблюдения публикуются с сохранением авторства и прямых ссылок на оригинальные страницы NASA.',
      epicPortalLink: 'NASA DSCOVR EPIC',
      apodPortalLink: 'NASA APOD',
      copyrightLine: '© 2024–2026 ЕНОТКОРП · Окно во Вселенную',
      backToTop: 'Наверх'
    }
  },
  en: {
    appName: 'RACCOONCORP — NASA Observatory',
    appSubtitle: 'Window to the Universe',
    loadingText: 'Opening the Window to the Universe...',
    loadErrorTitle: 'Unable to load observations',
    loadErrorRetry: 'Try again',
    refreshNotice: 'Showing the most recently loaded observation data.',
    nav: {
      earth: 'Earth from Space',
      stories: 'Cosmic Stories',
      archive: 'Archive',
      about: 'About'
    },
    earth: {
      kicker: 'Earth Observation · DSCOVR EPIC',
      title: 'Earth from Space',
      subtitle: 'Full sunlit views of our planet from roughly 1.5 million kilometers away — step through frames, watch Earth rotate, and browse available observation dates.',
      latestObservationBadge: (dateLabel) => `Latest available observation · ${dateLabel}`,
      selectedObservationBadge: (dateLabel) => `Observation series · ${dateLabel}`,
      naturalLabel: 'Natural',
      enhancedLabel: 'Enhanced',
      naturalHint: 'True natural Earth color',
      enhancedHint: 'Enhanced atmospheric & land contrast',
      playLabel: 'Play rotation',
      pauseLabel: 'Pause',
      prevFrame: 'Previous frame',
      nextFrame: 'Next frame',
      speedLabel: 'Speed',
      frameCounter: (current, total) => `Frame ${current} of ${total}`,
      dateStripLabel: 'Available observation dates',
      framesShort: (count) => `${count} frames`,
      expandView: 'Inspect full size',
      detailsToggle: 'Scientific observation parameters',
      centroidLabel: 'Sub-satellite Earth point',
      dscovrDistanceLabel: 'DSCOVR distance from Earth',
      sunDistanceLabel: 'Distance to the Sun',
      lunarDistanceLabel: 'Distance to the Moon',
      captureTimeLabel: 'Capture time',
      attributionLabel: 'Image credit',
      sourceLinkLabel: 'NASA EPIC Portal',
      earthAlt: (collection, date, time) => {
        const modeLabel = collection === 'enhanced' ? 'Enhanced' : 'Natural';
        return `Earth from space (${modeLabel}), ${date}${time ? `, ${time}` : ''}`;
      },
      fallbackTitle: 'Image temporarily unavailable',
      fallbackDesc: 'You can explore this observation series directly on the official NASA EPIC portal.',
      errorTitle: 'Unable to load Earth observations',
      retryBtn: 'Retry'
    },
    stories: {
      kicker: 'Astronomy Picture of the Day · APOD',
      title: 'Cosmic Stories',
      subtitle: 'Curated astronomical photography, video, and scientific stories with full credit and links to original NASA publications.',
      readStoryBtn: 'Open story',
      watchVideoBtn: 'Watch video',
      openSourceBtn: 'Original NASA page',
      authorLabel: 'Credit',
      needsExplanationRu:
        'A curated Russian explanation is being prepared. You can read the original publication on NASA.',
      needsExplanationEn:
        'A curated explanation is not yet included for this exhibit. Read the full original story on the official NASA APOD website.',
      factSourcesLabel: 'Scientific sources',
      aiExplanationLabel: 'Popular-science explanation',
      videoLabel: 'Video',
      errorTitle: 'Unable to load cosmic stories',
      retryBtn: 'Retry',
      emptyTitle: 'No stories available yet',
      emptyDesc: 'Curated stories will appear automatically in future observatory updates.'
    },
    archive: {
      kicker: 'Explore Observations',
      title: 'Observatory Archive',
      subtitle: 'Earth observation series organized by date, curated cosmic stories, and upcoming scientific collections.',
      tabEpic: 'Earth Series (EPIC)',
      tabApod: 'Cosmic Stories (APOD)',
      tabLibrary: 'NASA Library',
      searchPlaceholder: 'Search by title, date, or credit...',
      epicSeriesFrames: (count) => `${count} Earth rotation frames`,
      epicSeriesOpenBtn: 'Open in Earth viewer',
      epicSeriesRange: (start, end) => `${start} — ${end}`,
      epicBothModes: 'Natural & Enhanced',
      libraryTitle: 'NASA Image & Video Library — Upcoming Direction',
      libraryDesc:
        'This space is ready for historic and active NASA mission collections. Reviewed materials will appear here automatically once added to the archive.',
      libraryBadge: 'Future direction',
      noMatches: 'No matching observations found',
      resetSearch: 'Clear search',
      retryBtn: 'Retry',
      sourceError: 'Unable to load this archive section'
    },
    modal: {
      close: 'Close window',
      prev: 'Previous exhibit',
      next: 'Next exhibit',
      dateLabel: 'Date',
      timeLabel: 'Time (UTC)',
      authorLabel: 'Credit',
      sourceBtn: (source) =>
        source === 'epic'
          ? 'Open on NASA EPIC'
          : source === 'library'
            ? 'Open in NASA Library'
            : 'Open on NASA APOD',
      videoFallbackDesc: 'If inline playback is unavailable in your browser, watch the video on the official NASA page.',
      mediaFallbackTitle: 'Image temporarily unavailable',
      mediaFallbackDesc: 'Open the original publication directly on the official NASA website below.',
      epicDetailsToggle: 'Scientific observation parameters',
      storySectionTitle: 'About this observation',
      factSourcesLabel: 'Sources'
    },
    footer: {
      aboutTitle: 'Independent Amateur Observatory',
      aboutText:
        '“Window to the Universe” is an independent science education project by RACCOONCORP (ЕНОТКОРП). It is not affiliated with or endorsed by NASA.',
      sourcesTitle: 'Open Scientific Sources',
      sourcesText:
        'Every exhibit preserves original credits and links directly to canonical NASA publications.',
      epicPortalLink: 'NASA DSCOVR EPIC',
      apodPortalLink: 'NASA APOD',
      copyrightLine: '© 2024–2026 RACCOONCORP · Window to the Universe',
      backToTop: 'Top'
    }
  }
};
