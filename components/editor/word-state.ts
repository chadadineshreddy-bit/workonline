import { create } from "zustand";

export type WordTheme = "obsidian" | "fluent" | "dark-gray" | "white";
export type WordViewMode = "print" | "read" | "web" | "focus" | "outline" | "draft";
export type RibbonTab =
  | "File"
  | "Home"
  | "Insert"
  | "Design"
  | "Layout"
  | "References"
  | "Mailings"
  | "Review"
  | "View"
  | "Help"
  | "Acrobat"
  | "Draw"
  | "Developer"
  | "Table Design"
  | "Table Layout"
  | "Picture Format"
  | "Shape Format"
  | "Header & Footer";

export interface CommentThread {
  id: string;
  author: string;
  avatarColor: string;
  text: string;
  selectedText?: string;
  timestamp: string;
  resolved: boolean;
  replies: { id: string; author: string; text: string; timestamp: string }[];
}

export interface DocumentSnapshot {
  id: string;
  timestamp: string;
  title: string;
  html: string;
  wordCount: number;
}

export interface MergeContact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  email: string;
  city: string;
  address: string;
}

export interface CitationItem {
  id: string;
  type: "APA" | "MLA" | "Chicago" | "IEEE" | "Harvard";
  author: string;
  title: string;
  year: string;
  publisher?: string;
}

export interface MacroAction {
  id: string;
  name: string;
  command: string;
  value?: string;
  timestamp: string;
}

export interface BuildingBlockItem {
  id: string;
  name: string;
  category: "AutoText" | "Callout" | "Header" | "Cover Page" | "Table" | "Signature";
  description: string;
  content: string;
}

export interface AutoCorrectRule {
  id: string;
  shortcut: string;
  replacement: string;
}

export interface FloatingLayerItem {
  id: string;
  name: string;
  type: "image" | "shape" | "chart" | "smartart" | "textbox";
  visible: boolean;
  zIndex: number;
  lockAnchor: boolean;
  moveWithText: boolean;
}

export interface MasterSubdocument {
  id: string;
  title: string;
  filename: string;
  content: string;
  expanded: boolean;
}

export interface FindReplaceFormat {
  font?: string;
  fontSize?: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  highlight?: string;
  style?: string;
}

export interface AutoRecoverData {
  timestamp: string;
  title: string;
  html: string;
  wordCount: number;
}

export interface InkStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: "pen" | "highlighter" | "pencil";
}

interface WordEditorState {
  // Document Identity
  docTitle: string;
  setDocTitle: (title: string) => void;
  saveStatus: "saved" | "saving" | "unsaved";
  setSaveStatus: (status: "saved" | "saving" | "unsaved") => void;
  lastSavedTime: string;
  setLastSavedTime: (time: string) => void;

  // Theme & Appearance
  theme: WordTheme;
  setTheme: (theme: WordTheme) => void;
  ribbonDisplayMode: "tabs-and-commands" | "tabs-only" | "auto-hide";
  setRibbonDisplayMode: (mode: "tabs-and-commands" | "tabs-only" | "auto-hide") => void;

  // Active Ribbon & Contextual Tabs
  activeTab: RibbonTab;
  setActiveTab: (tab: RibbonTab) => void;
  contextualTab: RibbonTab | null;
  setContextualTab: (tab: RibbonTab | null) => void;

  // View & Geometry
  viewMode: WordViewMode;
  setViewMode: (mode: WordViewMode) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  showRuler: boolean;
  setShowRuler: (show: boolean) => void;
  showVerticalRuler: boolean;
  setShowVerticalRuler: (show: boolean) => void;
  showGridlines: boolean;
  setShowGridlines: (show: boolean) => void;
  showNavigationPane: boolean;
  setShowNavigationPane: (show: boolean) => void;
  hideWhiteSpace: boolean;
  setHideWhiteSpace: (hide: boolean) => void;
  splitView: boolean;
  setSplitView: (split: boolean) => void;

  // Paper & Margins
  paperSize: "a4" | "letter" | "legal" | "tabloid" | "a3" | "a5" | "executive" | "b5";
  setPaperSize: (size: "a4" | "letter" | "legal" | "tabloid" | "a3" | "a5" | "executive" | "b5") => void;
  orientation: "portrait" | "landscape";
  setOrientation: (orientation: "portrait" | "landscape") => void;
  margins: "normal" | "narrow" | "moderate" | "wide" | "mirrored" | "custom";
  setMargins: (m: "normal" | "narrow" | "moderate" | "wide" | "mirrored" | "custom") => void;
  columnsCount: number;
  setColumnsCount: (count: number) => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  pageColor: string;
  setPageColor: (color: string) => void;
  pageBorder: "none" | "box" | "shadow" | "double" | "dashed";
  setPageBorder: (border: "none" | "box" | "shadow" | "double" | "dashed") => void;
  styleSet: "default" | "basic-stylish" | "centered" | "compact" | "formal" | "minimal" | "modern" | "simple" | "traditional";
  setStyleSet: (set: "default" | "basic-stylish" | "centered" | "compact" | "formal" | "minimal" | "modern" | "simple" | "traditional") => void;

  // Metrics
  pageCount: number;
  setPageCount: (count: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
  charCount: number;
  setCharCount: (count: number) => void;
  selectedWordCount: number;
  setSelectedWordCount: (count: number) => void;
  selectedCharCount: number;
  setSelectedCharCount: (count: number) => void;

  // Active Formatting state
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  fontColor: string;
  setFontColor: (color: string) => void;
  highlightColor: string;
  setHighlightColor: (color: string) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;

  // Track Changes & Comments
  trackChanges: boolean;
  setTrackChanges: (enabled: boolean) => void;
  trackingDisplayMode: "simple" | "all" | "none" | "original";
  setTrackingDisplayMode: (mode: "simple" | "all" | "none" | "original") => void;
  comments: CommentThread[];
  setComments: (comments: CommentThread[]) => void;
  addComment: (author: string, text: string, selectedText?: string) => void;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;
  addReply: (commentId: string, author: string, text: string) => void;

  // Version History
  versionHistory: DocumentSnapshot[];
  addSnapshot: (snapshot: DocumentSnapshot) => void;
  restoreSnapshot: (id: string) => DocumentSnapshot | undefined;

  // Mail Merge
  mergeContacts: MergeContact[];
  setMergeContacts: (contacts: MergeContact[]) => void;
  activeMergeIndex: number;
  setActiveMergeIndex: (idx: number) => void;
  isMergePreviewActive: boolean;
  setIsMergePreviewActive: (active: boolean) => void;

  // Citations & Footnotes
  citations: CitationItem[];
  citationStyle: "APA" | "MLA" | "Chicago" | "IEEE" | "Harvard";
  setCitationStyle: (style: "APA" | "MLA" | "Chicago" | "IEEE" | "Harvard") => void;
  addCitation: (c: CitationItem) => void;
  deleteCitation: (id: string) => void;

  // Digital Inking (Draw)
  inkStrokes: InkStroke[];
  addInkStroke: (stroke: InkStroke) => void;
  clearInkStrokes: () => void;
  activeInkTool: "none" | "pen" | "highlighter" | "pencil" | "eraser";
  setActiveInkTool: (tool: "none" | "pen" | "highlighter" | "pencil" | "eraser") => void;
  inkColor: string;
  setInkColor: (c: string) => void;
  inkSize: number;
  setInkSize: (s: number) => void;

  // Macros (Developer Tab)
  isRecordingMacro: boolean;
  setIsRecordingMacro: (rec: boolean) => void;
  recordedMacros: { name: string; actions: MacroAction[] }[];
  currentMacroActions: MacroAction[];
  startMacroRecording: (name: string) => void;
  stopMacroRecording: () => void;
  recordAction: (action: MacroAction) => void;

  // Protection & Encryption
  isMarkedAsFinal: boolean;
  setIsMarkedAsFinal: (isFinal: boolean) => void;
  isPasswordProtected: boolean;
  setIsPasswordProtected: (protectedMode: boolean) => void;
  docPasswordHash: string | null;
  setDocPasswordHash: (hash: string | null) => void;

  // Side Panes & Modals
  activeSidePane: "none" | "navigation" | "ai" | "comments" | "thesaurus" | "styles" | "clipboard" | "accessibility" | "reveal-formatting" | "layers" | "recovery" | "addins" | "selection";
  setActiveSidePane: (pane: "none" | "navigation" | "ai" | "comments" | "thesaurus" | "styles" | "clipboard" | "accessibility" | "reveal-formatting" | "layers" | "recovery" | "addins" | "selection") => void;
  showBackstage: boolean;
  setShowBackstage: (show: boolean) => void;
  backstageSection: "home" | "new" | "open" | "info" | "save" | "save-as" | "save-as-pdf" | "history" | "print" | "share" | "share-pdf" | "export" | "close" | "account" | "options" | "versions";
  setBackstageSection: (sec: "home" | "new" | "open" | "info" | "save" | "save-as" | "save-as-pdf" | "history" | "print" | "share" | "share-pdf" | "export" | "close" | "account" | "options" | "versions") => void;

  // Multi-item Clipboard history
  clipboardHistory: string[];
  addToClipboardHistory: (item: string) => void;

  // The Spike (Multi-Cut Buffer: Ctrl+F3 to append, Ctrl+Shift+F3 to paste all and clear)
  spikeBuffer: string[];
  cutToSpike: (text: string) => void;
  clearSpike: () => void;

  // Quick Access Toolbar customization
  qatItems: string[];
  setQatItems: (items: string[]) => void;

  // Field Codes (Alt+F9, F9, Ctrl+F11)
  showFieldCodes: boolean;
  setShowFieldCodes: (show: boolean) => void;
  fieldsLocked: boolean;
  setFieldsLocked: (locked: boolean) => void;

  // Building Blocks Organizer (AutoText / Quick Parts / F3)
  buildingBlocks: BuildingBlockItem[];
  addBuildingBlock: (block: BuildingBlockItem) => void;
  deleteBuildingBlock: (id: string) => void;

  // AutoCorrect & AutoFormat As You Type & Math AutoCorrect
  autoCorrectRules: AutoCorrectRule[];
  addAutoCorrectRule: (shortcut: string, replacement: string) => void;
  deleteAutoCorrectRule: (id: string) => void;
  autoFormatAsYouType: {
    smartQuotes: boolean;
    hyphensToDashes: boolean;
    fractions: boolean;
    ordinals: boolean;
    horizontalRules: boolean;
    autoHyperlinks: boolean;
    mathAutoCorrect: boolean;
  };
  setAutoFormatOption: (key: string, value: boolean) => void;

  // Floating Layers & Vector Alignment
  floatingLayers: FloatingLayerItem[];
  setFloatingLayers: (layers: FloatingLayerItem[]) => void;
  toggleLayerVisibility: (id: string) => void;
  reorderLayer: (id: string, direction: "up" | "down" | "front" | "back") => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;

  // Outline View & Master Documents
  outlineLevelFilter: number | "all";
  setOutlineLevelFilter: (lvl: number | "all") => void;
  masterSubdocuments: MasterSubdocument[];
  setMasterSubdocuments: (docs: MasterSubdocument[]) => void;
  addMasterSubdocument: (doc: MasterSubdocument) => void;
  removeMasterSubdocument: (id: string) => void;
  toggleSubdocumentExpanded: (id: string) => void;

  // Built-in Add-ins Store
  installedAddins: string[];
  installAddin: (id: string) => void;
  uninstallAddin: (id: string) => void;
  activeAddinTab: string;
  setActiveAddinTab: (tab: string) => void;

  // Custom Keyboard Shortcuts
  customShortcuts: Record<string, string>;
  setCustomShortcut: (commandId: string, keyCombo: string) => void;
  resetShortcutsToDefault: () => void;

  // Diagnostics, AutoRecover Crash Protection & Privacy Scrubber
  autoRecoverSnapshot: AutoRecoverData | null;
  setAutoRecoverSnapshot: (snap: AutoRecoverData | null) => void;
  hasRecoverySession: boolean;
  setHasRecoverySession: (has: boolean) => void;

  // Active Modals
  activeModal:
    | "none"
    | "find-replace"
    | "building-blocks"
    | "advanced-typography"
    | "smartart"
    | "table-tools"
    | "addins"
    | "customize-shortcuts"
    | "document-inspector"
    | "autocorrect-options";
  setActiveModal: (
    modal:
      | "none"
      | "find-replace"
      | "building-blocks"
      | "advanced-typography"
      | "smartart"
      | "table-tools"
      | "addins"
      | "customize-shortcuts"
      | "document-inspector"
      | "autocorrect-options"
  ) => void;
}

export const useWordStore = create<WordEditorState>((set, get) => ({
  docTitle: "Document1 - Word",
  setDocTitle: (title) => set({ docTitle: title }),
  saveStatus: "saved",
  setSaveStatus: (status) => set({ saveStatus: status }),
  lastSavedTime: "Just now",
  setLastSavedTime: (time) => set({ lastSavedTime: time }),

  theme: "obsidian",
  setTheme: (theme) => set({ theme }),
  ribbonDisplayMode: "tabs-and-commands",
  setRibbonDisplayMode: (mode) => set({ ribbonDisplayMode: mode }),

  activeTab: "Home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  contextualTab: null,
  setContextualTab: (tab) => set({ contextualTab: tab }),

  viewMode: "print",
  setViewMode: (mode) => set({ viewMode: mode }),
  zoom: 100,
  setZoom: (zoom) => set({ zoom }),
  showRuler: true,
  setShowRuler: (show) => set({ showRuler: show }),
  showVerticalRuler: true,
  setShowVerticalRuler: (show) => set({ showVerticalRuler: show }),
  showGridlines: false,
  setShowGridlines: (show) => set({ showGridlines: show }),
  showNavigationPane: false,
  setShowNavigationPane: (show) => set({ showNavigationPane: show }),
  hideWhiteSpace: false,
  setHideWhiteSpace: (hide) => set({ hideWhiteSpace: hide }),
  splitView: false,
  setSplitView: (split) => set({ splitView: split }),

  paperSize: "a4",
  setPaperSize: (size) => set({ paperSize: size }),
  orientation: "portrait",
  setOrientation: (orientation) => set({ orientation }),
  margins: "normal",
  setMargins: (m) => set({ margins: m }),
  columnsCount: 1,
  setColumnsCount: (count) => set({ columnsCount: count }),
  watermarkText: "",
  setWatermarkText: (text) => set({ watermarkText: text }),
  pageColor: "#FFFFFF",
  setPageColor: (color) => set({ pageColor: color }),
  pageBorder: "none",
  setPageBorder: (b) => set({ pageBorder: b }),
  styleSet: "default",
  setStyleSet: (s) => set({ styleSet: s }),

  pageCount: 1,
  setPageCount: (count) => set({ pageCount: count }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  wordCount: 0,
  setWordCount: (count) => set({ wordCount: count }),
  charCount: 0,
  setCharCount: (count) => set({ charCount: count }),
  selectedWordCount: 0,
  setSelectedWordCount: (count) => set({ selectedWordCount: count }),
  selectedCharCount: 0,
  setSelectedCharCount: (count) => set({ selectedCharCount: count }),

  fontFamily: "Calibri",
  setFontFamily: (font) => set({ fontFamily: font }),
  fontSize: "11pt",
  setFontSize: (size) => set({ fontSize: size }),
  fontColor: "#000000",
  setFontColor: (color) => set({ fontColor: color }),
  highlightColor: "#FFFF00",
  setHighlightColor: (color) => set({ highlightColor: color }),
  lineSpacing: "1.15",
  setLineSpacing: (spacing) => set({ lineSpacing: spacing }),

  trackChanges: false,
  setTrackChanges: (enabled) => set({ trackChanges: enabled }),
  trackingDisplayMode: "simple",
  setTrackingDisplayMode: (mode) => set({ trackingDisplayMode: mode }),
  comments: [],
  setComments: (comments) => set({ comments }),
  addComment: (author, text, selectedText) => {
    const newComment: CommentThread = {
      id: Date.now().toString(),
      author,
      avatarColor: "#0F6CBD",
      text,
      selectedText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      resolved: false,
      replies: [],
    };
    set({ comments: [newComment, ...get().comments] });
  },
  resolveComment: (id) =>
    set({
      comments: get().comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)),
    }),
  deleteComment: (id) => set({ comments: get().comments.filter((c) => c.id !== id) }),
  addReply: (commentId, author, text) => {
    set({
      comments: get().comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                { id: Date.now().toString(), author, text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
              ],
            }
          : c
      ),
    });
  },

  versionHistory: [],
  addSnapshot: (snapshot) =>
    set({
      versionHistory: [snapshot, ...get().versionHistory.slice(0, 19)],
    }),
  restoreSnapshot: (id) => get().versionHistory.find((v) => v.id === id),

  mergeContacts: [
    { id: "1", firstName: "Alex", lastName: "Morgan", company: "Acrobatix Cloud", role: "VP Engineering", email: "a.morgan@acrobatix.io", city: "San Francisco", address: "100 Market St" },
    { id: "2", firstName: "Sarah", lastName: "Jenkins", company: "Globex Corp", role: "Chief Architect", email: "s.jenkins@globex.org", city: "New York", address: "450 5th Ave" },
    { id: "3", firstName: "David", lastName: "Chen", company: "Apex Digital", role: "Product Director", email: "d.chen@apex.tech", city: "Austin", address: "789 Congress Ave" },
  ],
  setMergeContacts: (contacts) => set({ mergeContacts: contacts }),
  activeMergeIndex: 0,
  setActiveMergeIndex: (idx) => set({ activeMergeIndex: idx }),
  isMergePreviewActive: false,
  setIsMergePreviewActive: (active) => set({ isMergePreviewActive: active }),

  citations: [],
  citationStyle: "APA",
  setCitationStyle: (style) => set({ citationStyle: style }),
  addCitation: (c) => set({ citations: [c, ...get().citations] }),
  deleteCitation: (id) => set({ citations: get().citations.filter((item) => item.id !== id) }),

  inkStrokes: [],
  addInkStroke: (stroke) => set({ inkStrokes: [...get().inkStrokes, stroke] }),
  clearInkStrokes: () => set({ inkStrokes: [] }),
  activeInkTool: "none",
  setActiveInkTool: (tool) => set({ activeInkTool: tool }),
  inkColor: "#0F6CBD",
  setInkColor: (c) => set({ inkColor: c }),
  inkSize: 3,
  setInkSize: (s) => set({ inkSize: s }),

  isRecordingMacro: false,
  setIsRecordingMacro: (rec) => set({ isRecordingMacro: rec }),
  recordedMacros: [],
  currentMacroActions: [],
  startMacroRecording: (name) => set({ isRecordingMacro: true, currentMacroActions: [] }),
  stopMacroRecording: () => {
    const actions = get().currentMacroActions;
    if (actions.length > 0) {
      set({
        recordedMacros: [...get().recordedMacros, { name: `Macro ${get().recordedMacros.length + 1}`, actions }],
        isRecordingMacro: false,
        currentMacroActions: [],
      });
    } else {
      set({ isRecordingMacro: false, currentMacroActions: [] });
    }
  },
  recordAction: (action) => {
    if (get().isRecordingMacro) {
      set({ currentMacroActions: [...get().currentMacroActions, action] });
    }
  },

  isMarkedAsFinal: false,
  setIsMarkedAsFinal: (isFinal) => set({ isMarkedAsFinal: isFinal }),
  isPasswordProtected: false,
  setIsPasswordProtected: (protectedMode) => set({ isPasswordProtected: protectedMode }),
  docPasswordHash: null,
  setDocPasswordHash: (hash) => set({ docPasswordHash: hash }),

  activeSidePane: "none",
  setActiveSidePane: (pane) => set({ activeSidePane: pane }),
  showBackstage: false,
  setShowBackstage: (show) => set({ showBackstage: show }),
  backstageSection: "home",
  setBackstageSection: (sec) => set({ backstageSection: sec }),

  clipboardHistory: [],
  addToClipboardHistory: (item) =>
    set({
      clipboardHistory: [item, ...get().clipboardHistory.filter((i) => i !== item).slice(0, 23)],
    }),

  spikeBuffer: [],
  cutToSpike: (text) => set({ spikeBuffer: [...get().spikeBuffer, text] }),
  clearSpike: () => set({ spikeBuffer: [] }),

  qatItems: ["autosave", "save", "undo", "redo", "print"],
  setQatItems: (items) => set({ qatItems: items }),

  showFieldCodes: false,
  setShowFieldCodes: (show) => set({ showFieldCodes: show }),
  fieldsLocked: false,
  setFieldsLocked: (locked) => set({ fieldsLocked: locked }),

  buildingBlocks: [
    {
      id: "bb-1",
      name: "Executive Header",
      category: "Header",
      description: "Modern two-tone company document header with date and confidential tag",
      content:
        '<div style="border-bottom: 2px solid #0F6CBD; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; font-family: Calibri, sans-serif;"><strong>ACROBATIX GLOBAL ENTERPRISE</strong><span style="color: #64748B;">INTERNAL CONFIDENTIAL</span></div>',
    },
    {
      id: "bb-2",
      name: "Warning Callout Box",
      category: "Callout",
      description: "Light amber shaded callout box with border for critical notes and alerts",
      content:
        '<div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 14px 0; border-radius: 4px; color: #92400E; font-size: 10.5pt;"><strong>IMPORTANT NOTICE:</strong> Please review all security guidelines before finalizing and distributing this document.</div>',
    },
    {
      id: "bb-3",
      name: "Formal Signature Block",
      category: "Signature",
      description: "Standard executive closing with date, signer name, and title",
      content:
        '<div style="margin-top: 32px; font-family: Calibri, sans-serif;"><p>Sincerely,</p><div style="height: 48px; border-bottom: 1px dashed #94A3B8; width: 220px; margin: 8px 0;"></div><p style="margin: 0; font-weight: bold;">Dinesh Reddy Chada</p><p style="margin: 0; color: #64748B; font-size: 9.5pt;">Lead Software Architect & Engineering Director</p></div>',
    },
    {
      id: "bb-4",
      name: "Metric KPI Table",
      category: "Table",
      description: "3-column modern styled comparison table for deliverables",
      content:
        '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #CBD5E1;"><tr style="background-color: #0F6CBD; color: white;"><th style="padding: 8px 12px; border: 1px solid #94A3B8; text-align: left;">Objective</th><th style="padding: 8px 12px; border: 1px solid #94A3B8; text-align: center;">Target</th><th style="padding: 8px 12px; border: 1px solid #94A3B8; text-align: right;">Status</th></tr><tr><td style="padding: 8px 12px; border: 1px solid #CBD5E1;">System Reliability</td><td style="padding: 8px 12px; border: 1px solid #CBD5E1; text-align: center;">99.99%</td><td style="padding: 8px 12px; border: 1px solid #CBD5E1; text-align: right; color: #16A34A; font-weight: bold;">On Track</td></tr><tr><td style="padding: 8px 12px; border: 1px solid #CBD5E1;">User Latency</td><td style="padding: 8px 12px; border: 1px solid #CBD5E1; text-align: center;">&lt; 50ms</td><td style="padding: 8px 12px; border: 1px solid #CBD5E1; text-align: right; color: #16A34A; font-weight: bold;">Achieved</td></tr></table>',
    },
  ],
  addBuildingBlock: (block) => set({ buildingBlocks: [block, ...get().buildingBlocks] }),
  deleteBuildingBlock: (id) => set({ buildingBlocks: get().buildingBlocks.filter((b) => b.id !== id) }),

  autoCorrectRules: [
    { id: "ac-1", shortcut: "(c)", replacement: "©" },
    { id: "ac-2", shortcut: "(C)", replacement: "©" },
    { id: "ac-3", shortcut: "(r)", replacement: "®" },
    { id: "ac-4", shortcut: "(R)", replacement: "®" },
    { id: "ac-5", shortcut: "(tm)", replacement: "™" },
    { id: "ac-6", shortcut: "(TM)", replacement: "™" },
    { id: "ac-7", shortcut: "-->", replacement: "→" },
    { id: "ac-8", shortcut: "<--", replacement: "←" },
    { id: "ac-9", shortcut: "<=>", replacement: "⇔" },
    { id: "ac-10", shortcut: "!=", replacement: "≠" },
    { id: "ac-11", shortcut: "+-", replacement: "±" },
    { id: "ac-12", shortcut: "adn", replacement: "and" },
    { id: "ac-13", shortcut: "teh", replacement: "the" },
  ],
  addAutoCorrectRule: (shortcut, replacement) =>
    set({
      autoCorrectRules: [
        { id: Date.now().toString(), shortcut, replacement },
        ...get().autoCorrectRules.filter((r) => r.shortcut !== shortcut),
      ],
    }),
  deleteAutoCorrectRule: (id) =>
    set({ autoCorrectRules: get().autoCorrectRules.filter((r) => r.id !== id) }),

  autoFormatAsYouType: {
    smartQuotes: true,
    hyphensToDashes: true,
    fractions: true,
    ordinals: true,
    horizontalRules: true,
    autoHyperlinks: true,
    mathAutoCorrect: true,
  },
  setAutoFormatOption: (key, value) =>
    set({
      autoFormatAsYouType: {
        ...get().autoFormatAsYouType,
        [key]: value,
      },
    }),

  floatingLayers: [
    { id: "layer-1", name: "Corporate Logo", type: "image", visible: true, zIndex: 1, lockAnchor: false, moveWithText: true },
    { id: "layer-2", name: "Executive Callout Shape", type: "shape", visible: true, zIndex: 2, lockAnchor: false, moveWithText: true },
  ],
  setFloatingLayers: (layers) => set({ floatingLayers: layers }),
  toggleLayerVisibility: (id) =>
    set({
      floatingLayers: get().floatingLayers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }),
  reorderLayer: (id, direction) => {
    const list = [...get().floatingLayers];
    const idx = list.findIndex((l) => l.id === id);
    if (idx === -1) return;
    if (direction === "up" && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    } else if (direction === "down" && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === "front") {
      const [item] = list.splice(idx, 1);
      list.push(item);
    } else if (direction === "back") {
      const [item] = list.splice(idx, 1);
      list.unshift(item);
    }
    set({ floatingLayers: list });
  },
  selectedLayerId: null,
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),

  outlineLevelFilter: "all",
  setOutlineLevelFilter: (lvl) => set({ outlineLevelFilter: lvl }),
  masterSubdocuments: [
    {
      id: "sub-1",
      title: "Chapter 1: Architectural Principles",
      filename: "chapter_01_principles.docx",
      content: "<p>System design principles, low-latency micro-services, and deterministic document reflow.</p>",
      expanded: true,
    },
    {
      id: "sub-2",
      title: "Chapter 2: Production Deployment & Verification",
      filename: "chapter_02_deployment.docx",
      content: "<p>Continuous integration, edge CDN caching, and verified zero-regression builds.</p>",
      expanded: false,
    },
  ],
  setMasterSubdocuments: (docs) => set({ masterSubdocuments: docs }),
  addMasterSubdocument: (doc) => set({ masterSubdocuments: [...get().masterSubdocuments, doc] }),
  removeMasterSubdocument: (id) =>
    set({ masterSubdocuments: get().masterSubdocuments.filter((d) => d.id !== id) }),
  toggleSubdocumentExpanded: (id) =>
    set({
      masterSubdocuments: get().masterSubdocuments.map((d) =>
        d.id === id ? { ...d, expanded: !d.expanded } : d
      ),
    }),

  installedAddins: ["qrcode", "mermaid", "emoji", "wikipedia", "lorem", "signature"],
  installAddin: (id) =>
    set({ installedAddins: [...get().installedAddins.filter((a) => a !== id), id] }),
  uninstallAddin: (id) =>
    set({ installedAddins: get().installedAddins.filter((a) => a !== id) }),
  activeAddinTab: "qrcode",
  setActiveAddinTab: (tab) => set({ activeAddinTab: tab }),

  customShortcuts: {
    save: "Ctrl+S",
    find: "Ctrl+F",
    replace: "Ctrl+H",
    cutToSpike: "Ctrl+F3",
    pasteSpike: "Ctrl+Shift+F3",
    toggleFieldCodes: "Alt+F9",
    updateFields: "F9",
    lockFields: "Ctrl+F11",
    unlockFields: "Ctrl+Shift+F11",
    expandSnippet: "F3",
    revealFormatting: "Shift+F1",
    print: "Ctrl+P",
    fontDialog: "Ctrl+D",
  },
  setCustomShortcut: (commandId, keyCombo) =>
    set({
      customShortcuts: { ...get().customShortcuts, [commandId]: keyCombo },
    }),
  resetShortcutsToDefault: () =>
    set({
      customShortcuts: {
        save: "Ctrl+S",
        find: "Ctrl+F",
        replace: "Ctrl+H",
        cutToSpike: "Ctrl+F3",
        pasteSpike: "Ctrl+Shift+F3",
        toggleFieldCodes: "Alt+F9",
        updateFields: "F9",
        lockFields: "Ctrl+F11",
        unlockFields: "Ctrl+Shift+F11",
        expandSnippet: "F3",
        revealFormatting: "Shift+F1",
        print: "Ctrl+P",
        fontDialog: "Ctrl+D",
      },
    }),

  autoRecoverSnapshot: null,
  setAutoRecoverSnapshot: (snap) => set({ autoRecoverSnapshot: snap }),
  hasRecoverySession: false,
  setHasRecoverySession: (has) => set({ hasRecoverySession: has }),

  activeModal: "none",
  setActiveModal: (modal) => set({ activeModal: modal }),
}));
