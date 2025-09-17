/**
 * FontAwesome Icon Validator and Fallback Utility
 * 
 * This utility helps prevent FontAwesome import errors by providing
 * validated icons and fallbacks for commonly used icons.
 */

import {
  faArrowUp,
  faArrowDown,
  faChartLine,
  faChartBar,
  faChartPie,
  faDownload,
  faEye,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faClock,
  faUserGraduate,
  faCalculator,
  faSave,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faFileAlt,
  faQrcode,
  faSignature,
  faPrint,
  faEnvelope,
  faTrophy,
  faPlus,
  faMinus,
  faCog,
  faBell,
  faUser,
  faLock,
  faUnlock,
  faHome,
  faCalendarAlt,
  faGraduationCap,
  faBuilding,
  faMoneyBillWave,
  faBus,
  faIdCard,
  faUsers,
  faUserTie,
  faUserCog,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUserSlash,
  faUserCheck,
  faUserEdit,
  faUserMinus,
  faUserPlus,
  faUserTimes,
  faUserClock,
  faChalkboardTeacher,
  faRoute,
  faExclamationTriangle as faWarning,
  faInfoCircle,
  faQuestionCircle,
  faCheck,
  faXmark,
  faSpinner,
  faSync,
  faRefresh,
  faUndo,
  faRedo,
  faCopy,
  faPaste,
  faCut,
  faFile,
  faFolder,
  faFolderOpen,
  faFileUpload,
  faFileDownload,
  faFileExport,
  faFileImport,
  faFileAlt as faFileText,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileImage,
  faFileVideo,
  faFileAudio,
  faFileArchive,
  faFileCode,
  faFileContract,
  faFileInvoice,
  faFileInvoiceDollar,
  faFileMedical,
  faFileMedicalAlt,
  faFilePrescription,
  faFileSignature,
  faFileUpload as faUpload,
  faFileDownload as faDownloadAlt,
  faFileExport as faExport,
  faFileImport as faImport,
  faFileAlt as faFileTextAlt,
  faFilePdf as faPdf,
  faFileWord as faWord,
  faFileExcel as faExcel,
  faFilePowerpoint as faPowerpoint,
  faFileImage as faImage,
  faFileVideo as faVideo,
  faFileAudio as faAudio,
  faFileArchive as faArchive,
  faFileCode as faCode,
  faFileContract as faContract,
  faFileInvoice as faInvoice,
  faFileInvoiceDollar as faInvoiceDollar,
  faFileMedical as faMedical,
  faFileMedicalAlt as faMedicalAlt,
  faFilePrescription as faPrescription,
  faFileSignature as faSignatureAlt
} from '@fortawesome/free-solid-svg-icons';

// Icon mapping for commonly used icons with fallbacks
export const ICON_MAPPING = {
  // Trend icons
  'faTrendingUp': faArrowUp,
  'faTrendingDown': faArrowDown,
  'faTrending': faChartLine,
  
  // Chart icons
  'faChartLine': faChartLine,
  'faChartBar': faChartBar,
  'faChartPie': faChartPie,
  
  // Action icons
  'faDownload': faDownload,
  'faUpload': faUpload,
  'faEye': faEye,
  'faEdit': faEdit,
  'faTrash': faTrash,
  'faSearch': faSearch,
  'faFilter': faFilter,
  'faSave': faSave,
  'faTimes': faTimes,
  'faCheckCircle': faCheckCircle,
  'faExclamationTriangle': faExclamationTriangle,
  'faWarning': faWarning,
  'faInfoCircle': faInfoCircle,
  'faQuestionCircle': faQuestionCircle,
  'faCheck': faCheck,
  'faXmark': faXmark,
  'faSpinner': faSpinner,
  'faSync': faSync,
  'faRefresh': faRefresh,
  'faUndo': faUndo,
  'faRedo': faRedo,
  'faCopy': faCopy,
  'faPaste': faPaste,
  'faCut': faCut,
  
  // File icons
  'faFile': faFile,
  'faFolder': faFolder,
  'faFolderOpen': faFolderOpen,
  'faFileUpload': faFileUpload,
  'faFileDownload': faFileDownload,
  'faFileExport': faFileExport,
  'faFileImport': faFileImport,
  'faFileText': faFileText,
  'faFilePdf': faFilePdf,
  'faFileWord': faFileWord,
  'faFileExcel': faFileExcel,
  'faFilePowerpoint': faFilePowerpoint,
  'faFileImage': faFileImage,
  'faFileVideo': faFileVideo,
  'faFileAudio': faFileAudio,
  'faFileArchive': faFileArchive,
  'faFileCode': faFileCode,
  'faFileContract': faFileContract,
  'faFileInvoice': faFileInvoice,
  'faFileInvoiceDollar': faFileInvoiceDollar,
  'faFileMedical': faFileMedical,
  'faFileMedicalAlt': faFileMedicalAlt,
  'faFilePrescription': faFilePrescription,
  'faFileSignature': faFileSignature,
  
  // User icons
  'faUser': faUser,
  'faUserGraduate': faUserGraduate,
  'faUserTie': faUserTie,
  'faUserCog': faUserCog,
  'faUserShield': faUserShield,
  'faUserSecret': faUserSecret,
  'faUserTag': faUserTag,
  'faUserLock': faUserLock,
  'faUserSlash': faUserSlash,
  'faUserCheck': faUserCheck,
  'faUserEdit': faUserEdit,
  'faUserMinus': faUserMinus,
  'faUserPlus': faUserPlus,
  'faUserTimes': faUserTimes,
  'faUserClock': faUserClock,
  'faUsers': faUsers,
  'faChalkboardTeacher': faChalkboardTeacher,
  
  // Navigation icons
  'faHome': faHome,
  'faCalendarAlt': faCalendarAlt,
  'faGraduationCap': faGraduationCap,
  'faBuilding': faBuilding,
  'faBus': faBus,
  'faRoute': faRoute,
  'faIdCard': faIdCard,
  'faTrophy': faTrophy,
  'faEnvelope': faEnvelope,
  'faPrint': faPrint,
  'faQrcode': faQrcode,
  'faSignature': faSignature,
  
  // Utility icons
  'faClock': faClock,
  'faCalculator': faCalculator,
  'faCog': faCog,
  'faBell': faBell,
  'faLock': faLock,
  'faUnlock': faUnlock,
  'faPlus': faPlus,
  'faMinus': faMinus,
  'faMoneyBillWave': faMoneyBillWave,
  
  // Fallback for unknown icons
  'default': faQuestionCircle
};

/**
 * Get a validated FontAwesome icon
 * @param {string} iconName - The name of the icon to get
 * @returns {Object} The FontAwesome icon object
 */
export const getIcon = (iconName) => {
  if (!iconName) {
    console.warn('Icon name is required');
    return ICON_MAPPING.default;
  }
  
  const icon = ICON_MAPPING[iconName];
  if (!icon) {
    console.warn(`Icon "${iconName}" not found, using fallback`);
    return ICON_MAPPING.default;
  }
  
  return icon;
};

/**
 * Validate if an icon exists in our mapping
 * @param {string} iconName - The name of the icon to validate
 * @returns {boolean} True if the icon exists
 */
export const isValidIcon = (iconName) => {
  return iconName && ICON_MAPPING.hasOwnProperty(iconName);
};

/**
 * Get all available icon names
 * @returns {string[]} Array of available icon names
 */
export const getAvailableIcons = () => {
  return Object.keys(ICON_MAPPING).filter(key => key !== 'default');
};

/**
 * Get trend icon based on comparison
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {Object} The appropriate trend icon
 */
export const getTrendIcon = (current, previous) => {
  if (current > previous) return ICON_MAPPING.faTrendingUp;
  if (current < previous) return ICON_MAPPING.faTrendingDown;
  return ICON_MAPPING.faChartLine;
};

export default {
  getIcon,
  isValidIcon,
  getAvailableIcons,
  getTrendIcon,
  ICON_MAPPING
};
