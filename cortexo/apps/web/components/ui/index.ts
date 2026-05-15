/**
 * Cortexo UI Primitives
 *
 * Import from '@/components/ui' — don't import from individual files.
 *
 * Examples:
 *   import { Card, CardHeader } from '@/components/ui';
 *   import { Badge, StatusBadge } from '@/components/ui';
 *   import { Toggle } from '@/components/ui';
 *   import { Button } from '@/components/ui';
 */

export { Card, CardHeader } from './card';
export type { } from './card';

export { Badge, StatusBadge } from './badge';

export { Toggle } from './toggle';

export { Button } from './button';

export { Ico, MetaText, ChipTag, SectionHead, EmptyState } from './primitives';

export { Input, Textarea, Select } from './input';

export { Table, Pagination, TableSkeleton } from './table';
export type { TableColumn } from './table';

export { Tooltip } from './tooltip';

export { Tabs, TabsList, Tab, TabsContent } from './tabs';

export { DatePicker } from './date-picker';

export { SortableList, SortableCard } from './sortable';

export { Chart, MiniChart } from './chart';

// Animations
export {
  PageTransition,
  Fade,
  Slide,
  Stagger,
  InView,
  Scale,
  Shimmer,
  HoverScale,
  Breathe,
} from './animations';

// Dropdown
export { Dropdown, SelectDropdown } from './dropdown';

// Avatar
export { Avatar, AvatarGroup, AvatarStack } from './avatar';

// Progress
export { Progress, CircularProgress, StepProgress } from './progress';

// Spinner
export {
  Spinner,
  LoadingDots,
  LoadingRing,
  SkeletonLine,
  SkeletonText,
  LoadingOverlay,
} from './spinner';

// Effects
export {
  AnimatedCard,
  GlowCard,
  Glass,
  DarkGlass,
  GradientBorder,
  Spotlight,
  NoiseOverlay,
  BentoGrid,
  BentoItem,
} from './effects';

// Form Controls
export { Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, RangeSlider } from './form-controls';

// Accordion & Dialogs
export { Accordion, Alert, ConfirmDialog, SidePanel, NotificationToast } from './accordion';

// Hooks
export {
  useInfiniteScroll,
  useDebounce,
  useLocalStorage,
  useMediaQuery,
  useClickOutside,
  useKeyPress,
  useToggle,
  usePrevious,
  useIsMounted,
} from './hooks';

// Upload
export { FileUpload, ImageUpload } from './upload';

// Tag Input
export { TagInput, MentionInput } from './tag-input';

// Markdown
export { Markdown, MarkdownEditor } from './markdown';

// Data Grid
export { DataGrid } from './data-grid';
export type { DataGridColumn } from './data-grid';

// Calendar
export { Calendar, CalendarView } from './calendar';

// Navigation
export { Breadcrumb, BreadcrumbSkeleton, Steps } from './breadcrumb';

// Tree View
export { TreeView, TreeViewSkeleton } from './tree-view';

// Carousel
export { Carousel, Gallery } from './carousel';

// Skeletons
export {
  Skeleton,
  SkeletonCard,
  SkeletonForm,
  SkeletonList,
  SkeletonStats,
  SkeletonChart,
  SkeletonTimeline,
  SkeletonWidget,
  SkeletonTable,
} from './skeleton';

// Virtual List
export { VirtualList, VirtualGrid, useVirtualScroll } from './virtual-list';

// Password
export { PasswordStrength, PasswordInput, ConfirmPassword } from './password';

// Code Editor
export { CodeEditor, CodeBlock, CodePlayground } from './code-editor';

// Diff Viewer
export { DiffViewer, DiffStats, FileDiff } from './diff-viewer';
