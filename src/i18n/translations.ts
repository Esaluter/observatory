import { Language } from '../types/dataContract';

export interface Translations {
  appName: string;
  appSubtitle: string;
  badgeIndependent: string;
  nav: {
    home: string;
    archive: string;
    calendar: string;
    directions: string;
    about: string;
  };
  hero: {
    tag: string;
    title: string;
    lead: string;
    ctaExplore: string;
    ctaArchive: string;
    featuredBadge: string;
    verifiedDomainBadge: string;
  };
  stats: {
    collectorActive: string;
    recordsCount: string;
    localMedia: string;
    videos: string;
    verifiedPublic: string;
    lastUpdated: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allMedia: string;
    imagesOnly: string;
    videosOnly: string;
    allRights: string;
    publicDomainOnly: string;
    copyrightedOnly: string;
    allMonths: string;
    resetFilters: string;
    resultsCount: (count: number, total: number) => string;
    noResults: string;
    noResultsHint: string;
    cardReadMore: string;
    cardVideo: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    selectMonth: string;
    availableDates: string;
    clickToView: string;
    monthSummary: (count: number) => string;
    legendImage: string;
    legendVideo: string;
  };
  detail: {
    originalScientificText: string;
    scienceNotice: string;
    scienceNoticeDetail: string;
    metadataHeader: string;
    dateLabel: string;
    authorLabel: string;
    rightsLabel: string;
    rightsStatus: {
      public_domain: string;
      copyrighted: string;
      unconfirmed: string;
      editorial: string;
    };
    sourceLabel: string;
    nasaSourceBtn: string;
    cacheStatusLabel: string;
    cachedLocally: string;
    remoteOnly: string;
    navPrev: string;
    navNext: string;
    close: string;
    copied: string;
    shareBtn: string;
    videoNotice: string;
    copyrightNoticeBadge: string;
    copyrightFallbackTitle: string;
    copyrightFallbackDesc: string;
  };
  comingSoon: {
    title: string;
    subtitle: string;
    badge: string;
    epicTitle: string;
    epicDesc: string;
    libraryTitle: string;
    libraryDesc: string;
    labTitle: string;
    labDesc: string;
    honestNote: string;
  };
  footer: {
    disclaimerTitle: string;
    disclaimerText: string;
    architectureTitle: string;
    architectureText: string;
    rightsTitle: string;
    rightsText: string;
    authorBrand: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    appName: 'ЕНОТКОРП — NASA Observatory',
    appSubtitle: 'Окно во Вселенную',
    badgeIndependent: 'Авторская веб-обсерватория',
    nav: {
      home: 'Главная',
      archive: 'Архив APOD',
      calendar: 'Календарь',
      directions: 'Миссии & Лаборатория',
      about: 'О проекте'
    },
    hero: {
      tag: 'Website Sprint 001 — First Light',
      title: 'Окно во Вселенную',
      lead: 'Почувствуйте себя путешественником, открывающим космическое пространство через объективы космических телескопов и автоматических станций NASA.',
      ctaExplore: 'Открыть экспонат',
      ctaArchive: 'Исследовать архив (66)',
      featuredBadge: 'Астрономическая картина дня (APOD)',
      verifiedDomainBadge: 'Подтверждено: общественное достояние'
    },
    stats: {
      collectorActive: 'Синхронизировано через NASA Collector',
      recordsCount: 'публикаций в архиве',
      localMedia: 'изображений в локальном кэше',
      videos: 'астрономических видео',
      verifiedPublic: 'разрешено для свободного показа',
      lastUpdated: 'Обновление архива'
    },
    gallery: {
      title: 'Архив APOD — Картина дня',
      subtitle: 'Подлинные астрономические открытия, зарегистрированные и проверенные коллектором',
      searchPlaceholder: 'Поиск по туманностям, галактикам, аппаратам или авторам...',
      allMedia: 'Все типы медиа',
      imagesOnly: 'Только снимки',
      videosOnly: 'Только видео',
      allRights: 'Все лицензии',
      publicDomainOnly: 'Общественное достояние',
      copyrightedOnly: 'Защищено авторским правом',
      allMonths: 'Все месяцы',
      resetFilters: 'Сбросить фильтры',
      resultsCount: (count, total) => `Показано ${count} из ${total} экспонатов архива`,
      noResults: 'По вашему запросу космических объектов не найдено',
      noResultsHint: 'Попробуйте изменить поисковые слова или сбросить фильтры',
      cardReadMore: 'Подробнее',
      cardVideo: 'Видеоматериал'
    },
    calendar: {
      title: 'Астрономический календарь',
      subtitle: 'Выберите день для погружения в космическое наблюдение нужной даты',
      selectMonth: 'Месяц наблюдения',
      availableDates: 'Доступные даты в архиве',
      clickToView: 'Нажмите на дату для перехода к публикации',
      monthSummary: (count) => `Записей за этот период: ${count}`,
      legendImage: 'Фотография',
      legendVideo: 'Видеозапись'
    },
    detail: {
      originalScientificText: 'Оригинальное научное описание',
      scienceNotice: 'Аутентичный текст NASA',
      scienceNoticeDetail: 'Оригинальный текст ученых и популяризаторов NASA приводится в полном объеме без сокращений и машинных искажений.',
      metadataHeader: 'Параметры наблюдения',
      dateLabel: 'Дата публикации',
      authorLabel: 'Авторство / Телескоп',
      rightsLabel: 'Статус прав',
      rightsStatus: {
        public_domain: 'Общественное достояние (Public Domain)',
        copyrighted: 'Защищено авторским правом (Copyright)',
        unconfirmed: 'Права на уточнении',
        editorial: 'Редакционное использование'
      },
      sourceLabel: 'Первоисточник',
      nasaSourceBtn: 'Открыть на портале NASA APOD',
      cacheStatusLabel: 'Хранилище медиа',
      cachedLocally: 'Локальный кэш Collector',
      remoteOnly: 'Внешний защищенный источник',
      navPrev: 'Предыдущая дата',
      navNext: 'Следующая дата',
      close: 'Закрыть окно (Esc)',
      copied: 'Ссылка на экспонат скопирована в буфер',
      shareBtn: 'Поделиться',
      videoNotice: 'Интерактивная научная симуляция / видеозапись',
      copyrightNoticeBadge: 'Ограничение публичного показа',
      copyrightFallbackTitle: 'Локальный показ ограничен правообладателем',
      copyrightFallbackDesc: 'В соответствии с юридическими стандартами проекта и политикой прав NASA, сторонние защищенные авторским правом снимки не публикуются без персонального разрешения авторов. Вы можете безопасно изучить этот снимок на официальном сайте NASA.'
    },
    comingSoon: {
      title: 'Перспективные направления обсерватории',
      subtitle: 'Архитектурные модули платформы, ожидающие подключения специализированных модулей NASA Collector',
      badge: 'Скоро в эфире',
      epicTitle: 'Earth / EPIC',
      epicDesc: 'Ежедневные снимки освещенного диска Земли с расстояния 1,5 млн км от спутника DSCOVR в точке Лагранжа L1. Отслеживание облачных вихрей, пылевых бурь и затмений.',
      libraryTitle: 'Cosmic Library',
      libraryDesc: 'Интеграция с NASA Image and Video Library: исторические архивы программы Аполлон, полеты Вояджеров, снимки Марса марсоходами Curiosity и Perseverance.',
      labTitle: 'Research Lab',
      labDesc: 'Интерактивные инструменты для анализа спектров звезд, изучения фаз луны, сравнения масштабов галактик и работы с звездными каталогами.',
      honestNote: 'Мы придерживаемся принципа научной честности: модули не заполняются фиктивными данными и активируются только после готовности реального сборщика.'
    },
    footer: {
      disclaimerTitle: 'О проекте и правовой статус',
      disclaimerText: '«Окно во Вселенную» — независимый научно-образовательный проект ЕНОТКОРП. Сайт не является официальным сервисом NASA и функционирует на базе открытых данных.',
      architectureTitle: 'Архитектура и автономность',
      architectureText: 'Статическое приложение без backend-сервера. Данные агрегируются локальным сборщиком NASA Collector по строгому data-contract без использования клиентских API-ключей.',
      rightsTitle: 'Уважение к интеллектуальной собственности',
      rightsText: 'Все права на авторские астрофотографии принадлежат указанным астрофотографам и институтам. Материалы NASA, ESA, STScI используются в образовательных целях.',
      authorBrand: 'ЕНОТКОРП • Лаборатория космических исследований'
    }
  },
  en: {
    appName: 'ENOTCORP — NASA Observatory',
    appSubtitle: 'Window to the Universe',
    badgeIndependent: 'Independent Web Observatory',
    nav: {
      home: 'Home',
      archive: 'APOD Archive',
      calendar: 'Calendar',
      directions: 'Missions & Lab',
      about: 'About'
    },
    hero: {
      tag: 'Website Sprint 001 — First Light',
      title: 'Window to the Universe',
      lead: 'Experience the sensation of an explorer charting deep space through the cameras of space telescopes and interplanetary probes.',
      ctaExplore: 'Explore Featured',
      ctaArchive: 'Browse Archive (66)',
      featuredBadge: 'Astronomy Picture of the Day (APOD)',
      verifiedDomainBadge: 'Verified: Public Domain'
    },
    stats: {
      collectorActive: 'Synchronized via NASA Collector',
      recordsCount: 'records in archive',
      localMedia: 'images in local cache',
      videos: 'astronomical videos',
      verifiedPublic: 'cleared for local public display',
      lastUpdated: 'Archive updated'
    },
    gallery: {
      title: 'APOD Archive — Picture of the Day',
      subtitle: 'Authentic cosmic discoveries validated and indexed by the Collector pipeline',
      searchPlaceholder: 'Search nebulae, galaxies, spacecraft, or astronomers...',
      allMedia: 'All Media Types',
      imagesOnly: 'Images Only',
      videosOnly: 'Videos Only',
      allRights: 'All Licenses',
      publicDomainOnly: 'Public Domain Only',
      copyrightedOnly: 'Copyright Protected',
      allMonths: 'All Months',
      resetFilters: 'Reset Filters',
      resultsCount: (count, total) => `Showing ${count} of ${total} cosmic exhibits`,
      noResults: 'No astronomical objects match your query',
      noResultsHint: 'Try adjusting your search keywords or resetting filters',
      cardReadMore: 'Read Science',
      cardVideo: 'Video Presentation'
    },
    calendar: {
      title: 'Astronomical Calendar',
      subtitle: 'Pick any date to inspect the celestial event recorded on that day',
      selectMonth: 'Observation Month',
      availableDates: 'Available Dates in Archive',
      clickToView: 'Click any date to open the publication',
      monthSummary: (count) => `Recorded publications: ${count}`,
      legendImage: 'Photograph',
      legendVideo: 'Video Recording'
    },
    detail: {
      originalScientificText: 'Original Scientific Explanation',
      scienceNotice: 'Authentic NASA Text',
      scienceNoticeDetail: 'The original description written by NASA scientists and educators is presented unabridged and unaltered.',
      metadataHeader: 'Observation Parameters',
      dateLabel: 'Publication Date',
      authorLabel: 'Credit / Telescope',
      rightsLabel: 'Rights Status',
      rightsStatus: {
        public_domain: 'Public Domain',
        copyrighted: 'Copyright Protected',
        unconfirmed: 'Verification Pending',
        editorial: 'Editorial Use'
      },
      sourceLabel: 'Canonical Source',
      nasaSourceBtn: 'Open on NASA APOD Portal',
      cacheStatusLabel: 'Media Storage',
      cachedLocally: 'Local Collector Cache',
      remoteOnly: 'External Secure Source',
      navPrev: 'Previous Date',
      navNext: 'Next Date',
      close: 'Close Window (Esc)',
      copied: 'Exhibit link copied to clipboard',
      shareBtn: 'Share',
      videoNotice: 'Interactive scientific simulation / video stream',
      copyrightNoticeBadge: 'Public Display Restricted',
      copyrightFallbackTitle: 'Local display restricted by rights holder',
      copyrightFallbackDesc: 'In accordance with project ethics and data contract standards, copyrighted third-party astrophotographs are not displayed from local cache without written permission. You can view the original full image securely on the official NASA website.'
    },
    comingSoon: {
      title: 'Observatory Exploration Frontiers',
      subtitle: 'Architectural modules awaiting dedicated NASA Collector ingestion pipes',
      badge: 'Coming Soon',
      epicTitle: 'Earth / EPIC',
      epicDesc: 'Daily full-disc natural color imagery of the sunlit side of Earth from 1 million miles away via the DSCOVR satellite at Lagrange Point L1.',
      libraryTitle: 'Cosmic Library',
      libraryDesc: 'Deep integration with the NASA Image and Video Library: Apollo mission audio, Voyager journeys, and rover photography from Jezero Crater.',
      labTitle: 'Research Lab',
      labDesc: 'Exploratory tools for stellar spectroscopy, lunar phase tracking, galactic scale comparisons, and astronomical catalog lookups.',
      honestNote: 'We adhere to scientific integrity: these modules are never filled with synthetic placeholders and will activate only when authentic data pipes are ready.'
    },
    footer: {
      disclaimerTitle: 'Project Disclaimer & Legal Notice',
      disclaimerText: '“Window to the Universe” is an independent educational initiative by ENOTCORP. This site is not an official product of NASA.',
      architectureTitle: 'Architecture & Autonomy',
      architectureText: 'Static web application with no server backend. Data is pre-compiled by the NASA Collector engine following strict data-contract specifications without client API keys.',
      rightsTitle: 'Intellectual Property Respect',
      rightsText: 'All copyrights for astrophotography belong to the credited astrophotographers and institutes. NASA/ESA/STScI public materials are cited for educational purposes.',
      authorBrand: 'ENOTCORP • Space Science Observatory'
    }
  }
};
