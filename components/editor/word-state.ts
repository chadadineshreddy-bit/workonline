import { create } from "zustand";

export type WordTheme = "fluent" | "obsidian" | "dark-gray" | "white";
export type WordViewMode = "print" | "read" | "web" | "focus" | "outline" | "draft";
export type RibbonTab =
  | "File"
  | "Home"
  | "Insert"
  | "Draw"
  | "Design"
  | "Layout"
  | "References"
  | "Mailings"
  | "Review"
  | "View"
  | "Developer"
  | "Help"
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
  activeSidePane: "none" | "navigation" | "ai" | "comments" | "thesaurus" | "styles" | "clipboard" | "accessibility";
  setActiveSidePane: (pane: "none" | "navigation" | "ai" | "comments" | "thesaurus" | "styles" | "clipboard" | "accessibility") => void;
  showBackstage: boolean;
  setShowBackstage: (show: boolean) => void;
  backstageSection: "new" | "open" | "save" | "export" | "print" | "info" | "versions" | "options" | "share";
  setBackstageSection: (sec: "new" | "open" | "save" | "export" | "print" | "info" | "versions" | "options" | "share") => void;

  // Multi-item Clipboard history
  clipboardHistory: string[];
  addToClipboardHistory: (item: string) => void;

  // Quick Access Toolbar customization
  qatItems: string[];
  setQatItems: (items: string[]) => void;
}

export const useWordStore = create<WordEditorState>((set, get) => ({
  docTitle: "Document1 - Word",
  setDocTitle: (title) => set({ docTitle: title }),
  saveStatus: "saved",
  setSaveStatus: (status) => set({ saveStatus: status }),
  lastSavedTime: "Just now",
  setLastSavedTime: (time) => set({ lastSavedTime: time }),

  theme: "fluent",
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
  backstageSection: "new",
  setBackstageSection: (sec) => set({ backstageSection: sec }),

  clipboardHistory: [],
  addToClipboardHistory: (item) =>
    set({
      clipboardHistory: [item, ...get().clipboardHistory.filter((i) => i !== item).slice(0, 23)],
    }),

  qatItems: ["autosave", "save", "undo", "redo", "print"],
  setQatItems: (items) => set({ qatItems: items }),
}));
