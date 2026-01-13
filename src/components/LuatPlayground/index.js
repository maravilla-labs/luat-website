import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { Play, RotateCcw, AlertCircle, Loader2, Eye, Code, Zap } from 'lucide-react';
import styles from './styles.module.css';

// Simple HTML formatter for better readability
function formatHtml(html) {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Split by tags while preserving them
  const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

  tokens.forEach(token => {
    const trimmed = token.trim();
    if (!trimmed) return;

    // Decrease indent for closing tags
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }

    formatted += tab.repeat(indent) + trimmed + '\n';

    // Increase indent for opening tags (not self-closing or void elements)
    if (trimmed.startsWith('<') &&
        !trimmed.startsWith('</') &&
        !trimmed.endsWith('/>') &&
        !trimmed.startsWith('<!') &&
        !/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(trimmed)) {
      indent++;
    }
  });

  return formatted.trim();
}

// Singleton for the Luat WASM module
let luatModule = null;
let luatLoading = null;

/**
 * Load the Luat WASM module
 */
async function loadLuatModule() {
  if (luatModule) return luatModule;
  if (luatLoading) return luatLoading;

  luatLoading = (async () => {
    // Load the Emscripten module via script tag
    await new Promise((resolve, reject) => {
      if (window.Module && typeof window.Module === 'function') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = '/wasm/luat-wasm.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load luat-wasm.js'));
      document.head.appendChild(script);
    });

    // Create the module instance
    const createModule = window.Module;
    const Module = await createModule({
      locateFile: (path) => `/wasm/${path}`
    });

    // Initialize the Luat engine
    const result = Module.ccall('luat_init', 'number', [], []);
    if (result !== 0) {
      throw new Error('Failed to initialize Luat engine');
    }

    luatModule = {
      addTemplate(path, source) {
        const r = Module.ccall('luat_add_template', 'number', ['string', 'string'], [path, source]);
        if (r !== 0) throw new Error(`Failed to add template: ${path}`);
      },
      clearTemplates() {
        Module.ccall('luat_clear_templates', 'number', [], []);
      },
      renderWithError(entry, context = {}) {
        const contextJson = JSON.stringify(context);
        const resultPtr = Module.ccall('luat_render_with_error', 'number', ['string', 'string'], [entry, contextJson]);
        if (resultPtr === 0) {
          return { success: false, html: null, error: 'Internal error' };
        }
        const resultJson = Module.UTF8ToString(resultPtr);
        Module._luat_free_string(resultPtr);
        return JSON.parse(resultJson);
      }
    };

    return luatModule;
  })();

  return luatLoading;
}

/**
 * LuatPlayground - Interactive code editor and renderer for Luat templates
 *
 * Props:
 * - code: Single file code (shorthand for files=[{name: 'main.luat', code}])
 * - files: Array of {name, code} for multi-file examples
 * - height: Editor height in pixels
 * - autoRun: Auto-run on load
 * - alpine: Include Alpine.js CDN for interactive examples
 * - htmx: Include htmx CDN for AJAX examples
 */
export default function LuatPlayground({
  code: initialCode = '',
  files: initialFiles = [],
  height = 300,
  autoRun = true,
  alpine = false,
  htmx = false,
}) {
  // Convert single code prop to files array
  const getInitialFiles = () => {
    if (initialFiles.length > 0) {
      return initialFiles;
    }
    if (initialCode) {
      return [{ name: 'main.luat', code: initialCode }];
    }
    return [{ name: 'main.luat', code: '' }];
  };

  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const [files, setFiles] = useState(getInitialFiles);
  const [activeTab, setActiveTab] = useState(0);
  const [outputTab, setOutputTab] = useState('preview'); // 'preview' or 'html'
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [luat, setLuat] = useState(null);
  const [compileTime, setCompileTime] = useState(null);
  const [renderTime, setRenderTime] = useState(null);
  const [cached, setCached] = useState(false);
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);
  const htmlViewerRef = useRef(null);
  const htmlViewerViewRef = useRef(null);
  const lastCompiledRef = useRef(null); // Cache: stores hash of last compiled code

  // Keep refs to avoid stale closures in callbacks
  const filesRef = useRef(files);
  filesRef.current = files;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // Load WASM module
  useEffect(() => {
    let mounted = true;

    loadLuatModule()
      .then((mod) => {
        if (mounted) {
          setLuat(mod);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('Failed to load Luat WASM:', e);
        if (mounted) {
          setError(`Failed to load Luat: ${e.message}`);
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  // Initialize CodeMirror editor
  useEffect(() => {
    let cleanup = null;

    async function initEditor() {
      if (!editorRef.current) return;

      // Clear existing editor
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }

      try {
        const { EditorView, basicSetup } = await import('codemirror');
        const { html } = await import('@codemirror/lang-html');
        const { oneDark } = await import('@codemirror/theme-one-dark');

        const codeView = new EditorView({
          doc: filesRef.current[activeTabRef.current]?.code || '',
          extensions: [
            basicSetup,
            html(),
            oneDark,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                const newCode = update.state.doc.toString();
                const tabIndex = activeTabRef.current;
                setFiles(prev => prev.map((f, i) =>
                  i === tabIndex ? { ...f, code: newCode } : f
                ));
              }
            }),
          ],
          parent: editorRef.current,
        });
        editorViewRef.current = codeView;
        cleanup = () => codeView.destroy();
      } catch (e) {
        console.error('Failed to load CodeMirror:', e);
      }
    }

    initEditor();
    return () => { if (cleanup) cleanup(); };
  }, [activeTab]);

  // Update editor content when tab changes
  useEffect(() => {
    const currentFiles = filesRef.current;
    const currentTab = activeTabRef.current;
    if (editorViewRef.current && currentFiles[currentTab]) {
      const currentContent = editorViewRef.current.state.doc.toString();
      if (currentContent !== currentFiles[currentTab].code) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: currentFiles[currentTab].code,
          },
        });
      }
    }
  }, [activeTab, files]);

  // Auto-run on initial load
  useEffect(() => {
    if (luat && autoRun && files.length > 0) {
      runCode();
    }
  }, [luat, autoRun]);

  // Initialize HTML viewer when showing HTML tab
  useEffect(() => {
    let cleanup = null;

    async function initHtmlViewer() {
      if (!htmlViewerRef.current || outputTab !== 'html' || !output) return;

      // Clear existing viewer
      if (htmlViewerViewRef.current) {
        htmlViewerViewRef.current.destroy();
        htmlViewerViewRef.current = null;
      }

      try {
        const { EditorView, basicSetup } = await import('codemirror');
        const { html } = await import('@codemirror/lang-html');
        const { oneDark } = await import('@codemirror/theme-one-dark');
        const { EditorState } = await import('@codemirror/state');

        const formattedHtml = formatHtml(output);

        const htmlView = new EditorView({
          state: EditorState.create({
            doc: formattedHtml,
            extensions: [
              basicSetup,
              html(),
              oneDark,
              EditorState.readOnly.of(true),
              EditorView.lineWrapping,
            ],
          }),
          parent: htmlViewerRef.current,
        });
        htmlViewerViewRef.current = htmlView;
        cleanup = () => htmlView.destroy();
      } catch (e) {
        console.error('Failed to load CodeMirror for HTML viewer:', e);
      }
    }

    initHtmlViewer();
    return () => { if (cleanup) cleanup(); };
  }, [outputTab, output]);

  // Helper to format time
  const formatTime = (ms) => {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(0)}µs`;
    }
    return `${ms.toFixed(2)}ms`;
  };

  // Helper to create a hash of files for caching
  const getFilesHash = (files) => {
    return files.map(f => `${f.name}:${f.code}`).join('|');
  };

  const runCode = useCallback(() => {
    if (!luat) return;

    // Use ref to always get latest files (avoids stale closure)
    const currentFiles = filesRef.current;
    const currentHash = getFilesHash(currentFiles);

    try {
      // Only reload templates if files changed
      const codeChanged = lastCompiledRef.current !== currentHash;

      if (codeChanged) {
        const compileStart = performance.now();
        luat.clearTemplates();
        for (const file of currentFiles) {
          luat.addTemplate(file.name, file.code);
        }
        const compileMs = performance.now() - compileStart;
        lastCompiledRef.current = currentHash;
        setCached(false);
        setCompileTime(formatTime(compileMs));
      } else {
        setCached(true);
      }

      // Find entry point (main.luat or first file)
      const entryFile = currentFiles.find(f => f.name === 'main.luat') || currentFiles[0];

      // Measure render time (multiple samples for accuracy)
      const samples = [];
      let result;
      for (let i = 0; i < 3; i++) {
        const renderStart = performance.now();
        result = luat.renderWithError(entryFile.name, {});
        samples.push(performance.now() - renderStart);
      }
      // Use the minimum (least affected by GC/browser overhead)
      const renderMs = Math.min(...samples);
      setRenderTime(formatTime(renderMs));

      if (result.success) {
        setOutput(result.html);
        setError(null);
      } else {
        setError(result.error);
        setOutput('');
      }
    } catch (e) {
      setError(e.message);
      setOutput('');
      setCompileTime(null);
      setRenderTime(null);
    }
  }, [luat]);

  const reset = useCallback(() => {
    const initial = getInitialFiles();
    setFiles(initial);
    setActiveTab(0);
    if (editorViewRef.current && initial[0]) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: initial[0].code,
        },
      });
    }
    setError(null);
    setOutput('');
    setCompileTime(null);
    setRenderTime(null);
    setCached(false);
    lastCompiledRef.current = null;
  }, [initialCode, initialFiles]);

  // Generate iframe content with Tailwind and optional libraries
  const alpineScript = alpine ? '<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>' : '';
  const htmxScript = htmx ? '<script src="https://unpkg.com/htmx.org@1.9.10"></script>' : '';

  const iframeSrc = `
<!DOCTYPE html>
<html class="${isDarkMode ? 'dark' : ''}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
    }
  </script>
  ${alpineScript}
  ${htmxScript}
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 1rem;
      margin: 0;
    }
    [x-cloak] { display: none !important; }
  </style>
</head>
<body class="${isDarkMode ? 'bg-gray-900 text-gray-100' : ''}">
  ${output}
</body>
</html>`;

  const hasMultipleFiles = files.length > 1;

  return (
    <div className={styles.playground}>
      {/* Editor Section */}
      <div className={styles.editorSection}>
        <div className={styles.header}>
          <div className={styles.windowControls}>
            <span className={styles.control}></span>
            <span className={styles.control}></span>
            <span className={styles.control}></span>
          </div>
          {hasMultipleFiles ? (
            <div className={styles.tabs}>
              {files.map((file, index) => (
                <button
                  key={file.name}
                  className={`${styles.tab} ${index === activeTab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {file.name}
                </button>
              ))}
            </div>
          ) : (
            <span className={styles.title}>{files[0]?.name || 'main.luat'}</span>
          )}
          <div className={styles.actions}>
            <button
              className={styles.button}
              onClick={runCode}
              disabled={loading || !luat}
              title="Run (Ctrl+Enter)"
            >
              {loading ? (
                <Loader2 size={14} className={styles.spinning} />
              ) : (
                <Play size={14} />
              )}
              <span>Run</span>
            </button>
            <button
              className={styles.buttonSecondary}
              onClick={reset}
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
        <div
          ref={editorRef}
          className={styles.editor}
          style={{ height }}
        />
      </div>

      {/* Output Section */}
      <div className={styles.outputSection}>
        <div className={styles.outputHeader}>
          <div className={styles.outputTabs}>
            <button
              className={`${styles.outputTab} ${outputTab === 'preview' ? styles.outputTabActive : ''}`}
              onClick={() => setOutputTab('preview')}
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
            <button
              className={`${styles.outputTab} ${outputTab === 'html' ? styles.outputTabActive : ''}`}
              onClick={() => setOutputTab('html')}
            >
              <Code size={14} />
              <span>HTML</span>
            </button>
          </div>
          {(compileTime || renderTime) && (
            <div
              className={styles.execTime}
              title={`${cached ? 'Compiled (cached)' : `Compile: ${compileTime}`} | Render: ${renderTime}`}
            >
              <Zap size={12} />
              {compileTime && (
                <span className={`${styles.compileInfo} ${cached ? styles.cached : ''}`}>
                  {cached ? '(cached)' : `compile: ${compileTime}`}
                </span>
              )}
              {compileTime && renderTime && <span className={styles.timeSeparator}>|</span>}
              {renderTime && <span className={styles.renderInfo}>{renderTime}</span>}
            </div>
          )}
        </div>
        <div className={styles.output} style={{ height }}>
          {error ? (
            <div className={styles.error}>
              <AlertCircle size={16} />
              <pre>{error}</pre>
            </div>
          ) : outputTab === 'preview' ? (
            output ? (
              <iframe
                srcDoc={iframeSrc}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className={styles.iframe}
                title="Luat output preview"
              />
            ) : (
              <div className={styles.placeholder}>
                {loading ? 'Loading Luat...' : 'Click "Run" to see the output'}
              </div>
            )
          ) : (
            output ? (
              <div
                ref={htmlViewerRef}
                className={styles.htmlViewer}
              />
            ) : (
              <div className={styles.placeholder}>
                {loading ? 'Loading Luat...' : 'Click "Run" to see the HTML output'}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
