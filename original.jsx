import React, { useState, useRef, useMemo } from "react";
import { Sparkles, Copy, Check, RefreshCw, Camera, X, AlertCircle, ImagePlus, Loader2, Trash2, Wand2 } from "lucide-react";

/* ----------------------------- Static Data ----------------------------- */

const CATEGORY_OPTIONS = ["Footwear", "Apparel", "Tech Gadget", "Beauty & Skincare", "Home Goods", "Accessory", "Food & Beverage", "Furniture"];

const MATERIAL_OPTIONS = ["Matte Finish", "Glossy Finish", "Metallic", "Leather", "Knit Fabric", "Glass", "Brushed Wood", "Ceramic", "Anodized Aluminum"];

const COLOR_SWATCHES = [
  { name: "Stealth Black", hex: "#0b0b0d" },
  { name: "Arctic White", hex: "#f5f5f0" },
  { name: "Volt Green", hex: "#9fff3d" },
  { name: "Ocean Blue", hex: "#1f5fa8" },
  { name: "Sunset Orange", hex: "#d9622b" },
  { name: "Rose Gold", hex: "#b76e79" },
  { name: "Charcoal Grey", hex: "#3a3a3d" },
  { name: "Ivory Cream", hex: "#efe6d8" },
  { name: "Primary Red", hex: "#dc2626" },
  { name: "Primary Blue", hex: "#2563eb" },
  { name: "Primary Yellow", hex: "#eab308" },
  { name: "Slate Grey", hex: "#64748b" },
];

const TONE_CHIPS = ["Sleek & Minimal", "Bold & Energetic", "Warm & Premium", "Clinical & Precise", "Luxurious", "Playful & Fun"];

const BACKGROUND_CHIPS = ["Seamless Cyclorama (Grey)", "Seamless Cyclorama (White)", "Glossy Reflective Podium", "Softly Lit Minimalist Set", "Outdoor Natural Light", "Industrial Loft", "Marble Pedestal"];

const FONT_CHIPS = ["Modern Sans-Serif", "Elegant Serif", "Bold Display", "Minimal Geometric", "Rounded Friendly"];

const PLATFORM_CHIPS = ["Instagram Reels", "TikTok", "Landing Page Hero", "Trade Show Display", "YouTube Ad", "Product Listing Video"];

const ASPECT_RATIOS = [
  { label: "Square", ratio: "1:1" },
  { label: "Portrait", ratio: "4:5" },
  { label: "Vertical / Reels", ratio: "9:16" },
  { label: "Widescreen", ratio: "16:9" },
  { label: "Landscape", ratio: "4:3" },
];

/* Studio auto-fill pools — used only when a field is left blank. */
const STUDIO_POOLS = {
  category: CATEGORY_OPTIONS,
  material: MATERIAL_OPTIONS,
  color: COLOR_SWATCHES.map((c) => c.name),
  tone: TONE_CHIPS,
  background: [...BACKGROUND_CHIPS, "Rooftop at Golden Hour", "Concrete Studio Floor"],
  font: FONT_CHIPS,
  textColor: COLOR_SWATCHES.map((c) => c.name),
  platform: PLATFORM_CHIPS,
  aspectRatio: ASPECT_RATIOS.map((a) => a.ratio),
  brandColor: COLOR_SWATCHES.map((c) => c.name),
};

function pickRandom(pool, count = 1, exclude = []) {
  const filtered = pool.filter((p) => !exclude.includes(p));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/* Matches an AI-suggested value against a known option list (case-insensitive). */
function matchOption(value, options) {
  if (!value) return null;
  const found = options.find((o) => o.toLowerCase() === String(value).trim().toLowerCase());
  return found || null;
}

/* ------------------------------- Icons ---------------------------------- */

function ColorSwatch({ hex, active }) {
  return (
    <div className="relative w-full h-9 rounded-md border border-black/30" style={{ backgroundColor: hex }}>
      {active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 rounded-md">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function AspectIcon({ ratio, active }) {
  const [w, h] = ratio.split(":").map(Number);
  const maxDim = 26;
  let boxW, boxH;
  if (w >= h) {
    boxW = maxDim;
    boxH = (h / w) * maxDim;
  } else {
    boxH = maxDim;
    boxW = (w / h) * maxDim;
  }
  return (
    <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0">
      <rect
        x={(40 - boxW) / 2}
        y={(40 - boxH) / 2}
        width={boxW}
        height={boxH}
        rx="2.5"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.25 : 0}
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/* ----------------------------- UI Primitives ----------------------------- */

function SectionShell({ number, title, mode, count, children, subtitle }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_-25px_rgba(217,70,239,0.35)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">{String(number).padStart(2, "0")}</span>
            <h3 className="text-base font-semibold text-zinc-100 tracking-tight">{title}</h3>
          </div>
          {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mode && (
            <span
              className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-1 rounded-full border ${
                mode === "single" ? "border-fuchsia-500/40 text-fuchsia-300 bg-fuchsia-500/10" : "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
              }`}
            >
              {mode === "single" ? "Pick One" : "Pick Any"}
            </span>
          )}
          {count > 0 && <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800 rounded-full px-2 py-1">{count} selected</span>}
        </div>
      </div>
      {children}
    </section>
  );
}

function OptionButton({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-sm font-medium rounded-xl border px-3.5 py-2.5 transition-all duration-150 ${
        active
          ? "border-transparent bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30"
          : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function CustomTextRow({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50"
    />
  );
}

/* -------------------------------- Main ----------------------------------- */

const CUSTOM = "__custom__";

export default function ProductShowcasePromptGenerator() {
  // product identity
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryCustom, setCategoryCustom] = useState("");
  const [material, setMaterial] = useState("");
  const [materialCustom, setMaterialCustom] = useState("");
  const [productColors, setProductColors] = useState([]);
  const [productColorsCustom, setProductColorsCustom] = useState("");

  // features
  const [feature1, setFeature1] = useState("");
  const [feature2, setFeature2] = useState("");
  const [feature3, setFeature3] = useState("");

  // brand
  const [brandName, setBrandName] = useState("");
  const [tone, setTone] = useState("");
  const [toneCustom, setToneCustom] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandColors, setBrandColors] = useState([]);
  const [brandColorsCustom, setBrandColorsCustom] = useState("");
  const [tagline, setTagline] = useState("");

  // visual style
  const [background, setBackground] = useState("");
  const [backgroundCustom, setBackgroundCustom] = useState("");
  const [font, setFont] = useState("");
  const [fontCustom, setFontCustom] = useState("");
  const [textColor, setTextColor] = useState("");
  const [textColorCustom, setTextColorCustom] = useState("");
  const [platform, setPlatform] = useState([]);
  const [aspectRatio, setAspectRatio] = useState("");

  // context (optional, never auto-filled)
  const [useCaseScenario, setUseCaseScenario] = useState("");
  const [lifestyleContext, setLifestyleContext] = useState("");

  // product reference image (required, attached as-is — not analyzed)
  const [productImage, setProductImage] = useState(null);
  const productFileInputRef = useRef(null);

  // optional studio/background reference image (analyzed via vision, like Case Studio's scene upload)
  const [sceneImage, setSceneImage] = useState(null);
  const [sceneDescription, setSceneDescription] = useState("");
  const [isDescribingScene, setIsDescribingScene] = useState(false);
  const [describeError, setDescribeError] = useState("");
  const sceneFileInputRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null); // { prompt, yourChoices, studioFilled }
  const [copyState, setCopyState] = useState("idle");
  const textareaRef = useRef(null);

  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillError, setAutoFillError] = useState("");
  const [autoFilledKeys, setAutoFilledKeys] = useState([]); // keys the AI last filled, for a brief highlight

  const toggleSingle = (current, setter) => (value) => setter(current === value ? "" : value);
  const toggleMulti = (list, setter) => (value) => setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const totalSelected = useMemo(() => {
    let n = 0;
    if (productName.trim()) n++;
    if (category && (category !== CUSTOM || categoryCustom.trim())) n++;
    if (material && (material !== CUSTOM || materialCustom.trim())) n++;
    n += productColors.length;
    if (productColorsCustom.trim()) n++;
    if (feature1.trim()) n++;
    if (feature2.trim()) n++;
    if (feature3.trim()) n++;
    if (brandName.trim()) n++;
    if (tone && (tone !== CUSTOM || toneCustom.trim())) n++;
    if (targetAudience.trim()) n++;
    n += brandColors.length;
    if (tagline.trim()) n++;
    if (background && (background !== CUSTOM || backgroundCustom.trim())) n++;
    if (sceneImage && sceneDescription.trim()) n++;
    if (font && (font !== CUSTOM || fontCustom.trim())) n++;
    if (textColor && (textColor !== CUSTOM || textColorCustom.trim())) n++;
    n += platform.length;
    if (aspectRatio) n++;
    if (useCaseScenario.trim()) n++;
    if (lifestyleContext.trim()) n++;
    return n;
  }, [productName, category, categoryCustom, material, materialCustom, productColors, productColorsCustom, feature1, feature2, feature3, brandName, tone, toneCustom, targetAudience, brandColors, tagline, background, backgroundCustom, sceneImage, sceneDescription, font, fontCustom, textColor, textColorCustom, platform, aspectRatio, useCaseScenario, lifestyleContext]);

  function resolveSingle(value, customValue) {
    if (!value) return null;
    if (value === CUSTOM) return customValue.trim() || null;
    return value;
  }

  async function describeSceneImage(base64Data, mediaType) {
    setIsDescribingScene(true);
    setDescribeError("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
                {
                  type: "text",
                  text: "Describe the full studio setup, background, and lighting in this image in one vivid, detailed sentence (roughly 25-45 words), written to be dropped straight into an AI video-generation prompt for a product showcase. Cover the backdrop, surface/podium, materials, colors, and lighting quality visible. Do not describe any product on it. Do not add any preamble, labels, or quotation marks. Return only the description sentence itself.",
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const textBlock = Array.isArray(data?.content) ? data.content.find((b) => b.type === "text") : null;
      const desc = textBlock?.text?.trim().replace(/^["']|["']$/g, "") || "";
      if (desc) {
        setSceneDescription(desc);
      } else {
        setDescribeError("Couldn't read the reference automatically — you can describe it manually below.");
      }
    } catch (e) {
      setDescribeError("Couldn't reach the description service — you can describe it manually below.");
    } finally {
      setIsDescribingScene(false);
    }
  }

  function handleProductImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSceneImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setSceneImage(dataUrl);
      setSceneDescription("");
      const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl);
      if (match) {
        const mediaType = match[1];
        const base64Data = match[2];
        describeSceneImage(base64Data, mediaType);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleRemoveSceneImage() {
    setSceneImage(null);
    setSceneDescription("");
    setDescribeError("");
    setIsDescribingScene(false);
  }

  function handleReset() {
    setProductName("");
    setCategory(""); setCategoryCustom("");
    setMaterial(""); setMaterialCustom("");
    setProductColors([]); setProductColorsCustom("");
    setFeature1(""); setFeature2(""); setFeature3("");
    setBrandName("");
    setTone(""); setToneCustom("");
    setTargetAudience("");
    setBrandColors([]); setBrandColorsCustom("");
    setTagline("");
    setBackground(""); setBackgroundCustom("");
    handleRemoveSceneImage();
    setFont(""); setFontCustom("");
    setTextColor(""); setTextColorCustom("");
    setPlatform([]);
    setAspectRatio("");
    setUseCaseScenario("");
    setLifestyleContext("");
    setProductImage(null);
    setResult(null);
    setCopyState("idle");
  }

  async function handleAutoFill() {
    setAutoFillError("");
    setAutoFilledKeys([]);

    // Build the list of eligible blank fields, with the exact option list (if any) the AI should pick from.
    const candidates = [
      { key: "productName", label: "Product Name", filled: productName.trim(), type: "text" },
      { key: "category", label: "Category", filled: category && (category !== CUSTOM || categoryCustom.trim()), type: "single", options: CATEGORY_OPTIONS },
      { key: "material", label: "Material / Finish", filled: material && (material !== CUSTOM || materialCustom.trim()), type: "single", options: MATERIAL_OPTIONS },
      { key: "productColors", label: "Product Color(s)", filled: productColors.length || productColorsCustom.trim(), type: "multi", options: COLOR_SWATCHES.map((c) => c.name), count: 2 },
      { key: "feature1", label: "Key Feature 1", filled: feature1.trim(), type: "text" },
      { key: "feature2", label: "Key Feature 2", filled: feature2.trim(), type: "text" },
      { key: "feature3", label: "Key Feature 3", filled: feature3.trim(), type: "text" },
      { key: "brandName", label: "Brand Name", filled: brandName.trim(), type: "text" },
      { key: "tone", label: "Brand Tone / Mood", filled: tone && (tone !== CUSTOM || toneCustom.trim()), type: "single", options: TONE_CHIPS },
      { key: "targetAudience", label: "Target Audience", filled: targetAudience.trim(), type: "text" },
      { key: "brandColors", label: "Brand Color Palette", filled: brandColors.length || brandColorsCustom.trim(), type: "multi", options: COLOR_SWATCHES.map((c) => c.name), count: 2 },
      { key: "tagline", label: "Tagline / CTA", filled: tagline.trim(), type: "text" },
      // Background is skipped if a reference image is already uploaded — that already resolves it.
      ...(!sceneImage ? [{ key: "background", label: "Background / Studio Style", filled: background && (background !== CUSTOM || backgroundCustom.trim()), type: "single", options: BACKGROUND_CHIPS }] : []),
      { key: "font", label: "Font Style", filled: font && (font !== CUSTOM || fontCustom.trim()), type: "single", options: FONT_CHIPS },
      { key: "textColor", label: "Text Color", filled: textColor && (textColor !== CUSTOM || textColorCustom.trim()), type: "single", options: COLOR_SWATCHES.map((c) => c.name) },
      { key: "platform", label: "Platform / Use Case", filled: platform.length, type: "multi", options: PLATFORM_CHIPS, count: 1 },
      { key: "aspectRatio", label: "Aspect Ratio", filled: !!aspectRatio, type: "single", options: ASPECT_RATIOS.map((a) => a.ratio) },
      { key: "useCaseScenario", label: "Use-Case Scenario", filled: useCaseScenario.trim(), type: "text" },
      { key: "lifestyleContext", label: "Lifestyle / Environment Context", filled: lifestyleContext.trim(), type: "text" },
    ];

    const blanks = candidates.filter((c) => !c.filled);
    if (blanks.length === 0) {
      setAutoFillError("Every field is already filled in — nothing left to auto-fill.");
      return;
    }

    // Context from whatever the user has already filled in, so suggestions stay coherent.
    const contextLines = candidates
      .filter((c) => c.filled)
      .map((c) => {
        const raw =
          c.key === "productColors" ? [...productColors, productColorsCustom].filter(Boolean).join(", ") :
          c.key === "brandColors" ? [...brandColors, brandColorsCustom].filter(Boolean).join(", ") :
          c.key === "platform" ? platform.join(", ") :
          c.key === "category" ? (category === CUSTOM ? categoryCustom : category) :
          c.key === "material" ? (material === CUSTOM ? materialCustom : material) :
          c.key === "tone" ? (tone === CUSTOM ? toneCustom : tone) :
          c.key === "background" ? (background === CUSTOM ? backgroundCustom : background) :
          c.key === "font" ? (font === CUSTOM ? fontCustom : font) :
          c.key === "textColor" ? (textColor === CUSTOM ? textColorCustom : textColor) :
          c.key === "aspectRatio" ? aspectRatio :
          c.key === "productName" ? productName :
          c.key === "brandName" ? brandName :
          c.key === "targetAudience" ? targetAudience :
          c.key === "tagline" ? tagline :
          c.key === "feature1" ? feature1 :
          c.key === "feature2" ? feature2 :
          c.key === "feature3" ? feature3 :
          c.key === "useCaseScenario" ? useCaseScenario :
          c.key === "lifestyleContext" ? lifestyleContext : "";
        return `- ${c.label}: ${raw}`;
      })
      .join("\n");

    const fieldSpecLines = blanks
      .map((c) => {
        if (c.type === "text") return `- "${c.key}": a short string for ${c.label}.`;
        if (c.type === "single") return `- "${c.key}": pick exactly one string from this list for ${c.label}: ${JSON.stringify(c.options)}.`;
        if (c.type === "multi") return `- "${c.key}": an array of ${c.count} string(s) from this list for ${c.label}: ${JSON.stringify(c.options)}.`;
        return "";
      })
      .join("\n");

    setIsAutoFilling(true);
    try {
      const contentBlocks = [];
      if (productImage) {
        const match = /^data:(.*?);base64,(.*)$/.exec(productImage);
        if (match) {
          contentBlocks.push({ type: "image", source: { type: "base64", media_type: match[1], data: match[2] } });
        }
      }
      contentBlocks.push({
        type: "text",
        text: `You are helping fill in a product showcase animation prompt. ${productImage ? "Use the attached product image as visual reference." : "No product image was provided."}

Fields already filled in by the user (keep every new suggestion consistent with these):
${contextLines || "(none yet — infer a cohesive, plausible product concept from the image alone)"}

Suggest values for exactly these blank fields:
${fieldSpecLines}

Respond with ONLY a raw JSON object (no markdown fences, no preamble, no explanation) mapping each field key above to its suggested value.`,
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          messages: [{ role: "user", content: contentBlocks }],
        }),
      });
      const data = await response.json();
      const textBlock = Array.isArray(data?.content) ? data.content.find((b) => b.type === "text") : null;
      const raw = textBlock?.text?.trim().replace(/^```json\s*|```$/g, "").trim() || "";
      const suggestions = JSON.parse(raw);

      const filledNow = [];

      const applySingleField = (key, setter, setterCustom, options) => {
        if (!(key in suggestions)) return;
        const val = suggestions[key];
        if (!val) return;
        const match = matchOption(val, options);
        if (match) setter(match);
        else {
          setter(CUSTOM);
          setterCustom(String(val));
        }
        filledNow.push(key);
      };

      const applyMultiField = (key, setter, setterCustom, options) => {
        if (!(key in suggestions)) return;
        const val = suggestions[key];
        if (!val) return;
        const arr = Array.isArray(val) ? val : String(val).split(",").map((s) => s.trim()).filter(Boolean);
        const matched = [];
        const unmatched = [];
        arr.forEach((v) => {
          const m = matchOption(v, options);
          if (m) matched.push(m);
          else unmatched.push(v);
        });
        if (matched.length) setter(matched);
        if (unmatched.length && setterCustom) setterCustom(unmatched.join(", "));
        filledNow.push(key);
      };

      const applyTextField = (key, setter) => {
        if (!(key in suggestions)) return;
        const val = suggestions[key];
        if (!val) return;
        setter(String(val));
        filledNow.push(key);
      };

      applyTextField("productName", setProductName);
      applySingleField("category", setCategory, setCategoryCustom, CATEGORY_OPTIONS);
      applySingleField("material", setMaterial, setMaterialCustom, MATERIAL_OPTIONS);
      applyMultiField("productColors", setProductColors, setProductColorsCustom, COLOR_SWATCHES.map((c) => c.name));
      applyTextField("feature1", setFeature1);
      applyTextField("feature2", setFeature2);
      applyTextField("feature3", setFeature3);
      applyTextField("brandName", setBrandName);
      applySingleField("tone", setTone, setToneCustom, TONE_CHIPS);
      applyTextField("targetAudience", setTargetAudience);
      applyMultiField("brandColors", setBrandColors, setBrandColorsCustom, COLOR_SWATCHES.map((c) => c.name));
      applyTextField("tagline", setTagline);
      if (!sceneImage) applySingleField("background", setBackground, setBackgroundCustom, BACKGROUND_CHIPS);
      applySingleField("font", setFont, setFontCustom, FONT_CHIPS);
      applySingleField("textColor", setTextColor, setTextColorCustom, COLOR_SWATCHES.map((c) => c.name));
      applyMultiField("platform", setPlatform, null, PLATFORM_CHIPS);
      applySingleField("aspectRatio", setAspectRatio, () => {}, ASPECT_RATIOS.map((a) => a.ratio));
      applyTextField("useCaseScenario", setUseCaseScenario);
      applyTextField("lifestyleContext", setLifestyleContext);

      setAutoFilledKeys(filledNow);
      if (filledNow.length === 0) {
        setAutoFillError("The AI didn't return usable suggestions — try again or fill fields manually.");
      }
    } catch (e) {
      setAutoFillError("Couldn't reach the auto-fill service — try again, or fill the remaining fields manually.");
    } finally {
      setIsAutoFilling(false);
    }
  }

  function handleGenerate() {
    setIsGenerating(true);
    setCopyState("idle");
    setTimeout(() => {
      const yourChoices = {};
      const studioFilled = {};

      const nameFinal = productName.trim() || pickRandom(["Signature Series", "Flagship Model", "Core Edition"], 1)[0];
      productName.trim() ? (yourChoices["Product Name"] = nameFinal) : (studioFilled["Product Name"] = nameFinal);

      const categoryVal = resolveSingle(category, categoryCustom);
      const categoryFinal = categoryVal || pickRandom(STUDIO_POOLS.category, 1)[0];
      categoryVal ? (yourChoices["Category"] = categoryFinal) : (studioFilled["Category"] = categoryFinal);

      const materialVal = resolveSingle(material, materialCustom);
      const materialFinal = materialVal || pickRandom(STUDIO_POOLS.material, 1)[0];
      materialVal ? (yourChoices["Material / Finish"] = materialFinal) : (studioFilled["Material / Finish"] = materialFinal);

      const colorList = [...productColors, ...productColorsCustom.split(",").map((s) => s.trim()).filter(Boolean)];
      const colorFinal = colorList.length ? colorList : pickRandom(STUDIO_POOLS.color, 2);
      colorList.length ? (yourChoices["Product Color(s)"] = colorFinal.join(", ")) : (studioFilled["Product Color(s)"] = colorFinal.join(", "));

      const featureList = [feature1, feature2, feature3].map((f) => f.trim()).filter(Boolean);
      const featureFinal = featureList.length ? featureList : pickRandom(["signature silhouette", "premium build quality", "standout finish"], 3);
      featureList.length === 3
        ? (yourChoices["Key Features"] = featureFinal.join(" · "))
        : featureList.length > 0
        ? ((yourChoices["Key Features"] = featureList.join(" · ")), (studioFilled["Key Features (extra)"] = featureFinal.slice(featureList.length).join(" · ")))
        : (studioFilled["Key Features"] = featureFinal.join(" · "));

      const brandNameFinal = brandName.trim() || nameFinal;
      brandName.trim() ? (yourChoices["Brand Name"] = brandNameFinal) : (studioFilled["Brand Name"] = brandNameFinal);

      const toneVal = resolveSingle(tone, toneCustom);
      const toneFinal = toneVal || pickRandom(STUDIO_POOLS.tone, 1)[0];
      toneVal ? (yourChoices["Brand Tone"] = toneFinal) : (studioFilled["Brand Tone"] = toneFinal);

      const audienceFinal = targetAudience.trim() || "design-conscious early adopters";
      targetAudience.trim() ? (yourChoices["Target Audience"] = audienceFinal) : (studioFilled["Target Audience"] = audienceFinal);

      const brandColorList = [...brandColors, ...brandColorsCustom.split(",").map((s) => s.trim()).filter(Boolean)];
      const brandColorFinal = brandColorList.length ? brandColorList : pickRandom(STUDIO_POOLS.brandColor, 2);
      brandColorList.length ? (yourChoices["Brand Color Palette"] = brandColorFinal.join(", ")) : (studioFilled["Brand Color Palette"] = brandColorFinal.join(", "));

      const taglineFinal = tagline.trim() || `Discover ${nameFinal}`;
      tagline.trim() ? (yourChoices["Tagline / CTA"] = taglineFinal) : (studioFilled["Tagline / CTA"] = taglineFinal);

      // Background — uploaded reference description takes priority, then preset/custom, then studio fallback
      let backgroundFinal;
      const uploadedDescription = sceneImage ? sceneDescription.trim() : "";
      const backgroundVal = resolveSingle(background, backgroundCustom);
      if (uploadedDescription) {
        backgroundFinal = uploadedDescription;
        yourChoices["Background / Studio Style"] = `${backgroundFinal} (from uploaded reference image)`;
      } else if (backgroundVal) {
        backgroundFinal = backgroundVal;
        yourChoices["Background / Studio Style"] = backgroundFinal;
      } else {
        backgroundFinal = pickRandom(STUDIO_POOLS.background, 1)[0];
        studioFilled["Background / Studio Style"] = backgroundFinal;
      }

      const fontVal = resolveSingle(font, fontCustom);
      const fontFinal = fontVal || pickRandom(STUDIO_POOLS.font, 1)[0];
      fontVal ? (yourChoices["Font Style"] = fontFinal) : (studioFilled["Font Style"] = fontFinal);

      const textColorVal = resolveSingle(textColor, textColorCustom);
      const textColorFinal = textColorVal || pickRandom(STUDIO_POOLS.textColor, 1)[0];
      textColorVal ? (yourChoices["Text Color"] = textColorFinal) : (studioFilled["Text Color"] = textColorFinal);

      const platformFinal = platform.length ? platform : pickRandom(STUDIO_POOLS.platform, 1);
      platform.length ? (yourChoices["Platform / Use Case"] = platformFinal.join(", ")) : (studioFilled["Platform / Use Case"] = platformFinal.join(", "));

      const aspectVal = resolveSingle(aspectRatio, "");
      const aspectFinal = aspectVal || pickRandom(STUDIO_POOLS.aspectRatio, 1)[0];
      const aspectLabel = ASPECT_RATIOS.find((a) => a.ratio === aspectFinal)?.label || "";
      aspectVal
        ? (yourChoices["Aspect Ratio"] = `${aspectFinal}${aspectLabel ? ` (${aspectLabel})` : ""}`)
        : (studioFilled["Aspect Ratio"] = `${aspectFinal}${aspectLabel ? ` (${aspectLabel})` : ""}`);

      const useCaseFinal = useCaseScenario.trim();
      if (useCaseFinal) yourChoices["Use-Case Scenario"] = useCaseFinal;

      const lifestyleFinal = lifestyleContext.trim();
      if (lifestyleFinal) yourChoices["Lifestyle / Environment"] = lifestyleFinal;

      const featureLine = (i) => featureFinal[i] || featureFinal[featureFinal.length - 1];

      const prompt = `Using the attached product image as the exact visual reference, generate a 6-frame storyboard for a modern, professional product showcase animation of ${nameFinal}, a ${categoryFinal} made of ${materialFinal} in ${colorFinal.join(" and ")}. The product's key features to highlight are ${featureFinal.join(", ")}. The overall mood should feel ${toneFinal}, targeting ${audienceFinal}, and should visually align with the brand identity of ${brandNameFinal}, whose signature colors are ${brandColorFinal.join(", ")}.

The animation is styled for ${platformFinal.join(" and ")}, at a ${aspectFinal} (${aspectLabel}) aspect ratio. Every frame shares a consistent studio environment with ${backgroundFinal}, modern three-point studio lighting with soft key light, subtle rim light to separate the product from the background, and smooth, physically accurate reflections and shadows. Camera movement is slow, deliberate, and cinematic — gentle push-ins, orbits, parallax — never fast cuts, rendered at a shallow depth of field keeping the product in crisp focus. On-screen text uses ${fontFinal} in ${textColorFinal}, appearing with restrained, purposeful motion (fade or slide, no gimmicks).

Break the storyboard into six frames, each with: frame number, shot description, camera angle/movement, lighting notes, and on-screen text (if any):

1. Establishing / Teaser — Product enters frame or is revealed in silhouette/partial view, building anticipation.
2. Hero Reveal — Full, clean view of the product in its most iconic angle, fully lit, establishing brand and product identity.
3. Feature Highlight 1 — Camera moves in on ${featureLine(0)}, with a callout or subtle motion graphic.
4. Feature Highlight 2 — Camera moves to ${featureLine(1)}${useCaseFinal ? `, or shows the product ${useCaseFinal}` : ""}, reinforcing functionality or benefit.
5. Feature Highlight 3 / Lifestyle Context — Shows ${featureLine(2)}${lifestyleFinal ? ` or the product within ${lifestyleFinal}` : ""}, grounding it in real-world appeal.
6. Closing / Brand Frame — Product settles into a final, polished hero pose alongside the ${brandNameFinal} logo and tagline "${taglineFinal}."

Sound design will be handled separately once the storyboard is approved and moves into animation production — do not include sound cues in this output.`;

      setResult({ prompt, yourChoices, studioFilled });
      setIsGenerating(false);
    }, 550);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
      return;
    } catch (e) {
      /* fall through */
    }
    try {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        if (ok) {
          setCopyState("copied");
          setTimeout(() => setCopyState("idle"), 2000);
          return;
        }
      }
    } catch (e) {
      /* fall through */
    }
    const ta = textareaRef.current;
    if (ta) {
      ta.focus();
      ta.select();
    }
    setCopyState("manual");
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 pb-32 overflow-hidden">
      {/* Ambient glow, inspired by the reference dashboard's pink/purple backlight */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-fuchsia-600/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-purple-700/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[24rem] h-[24rem] rounded-full bg-fuchsia-900/20 blur-[110px]" />
        <div className="absolute bottom-1/4 -right-24 w-[26rem] h-[26rem] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-purple-300">
              Case Studio
            </h1>
            <p className="text-xs font-medium text-zinc-500 tracking-wide -mt-0.5">Product Showcase Storyboard Prompt Generator</p>
          </div>
        </div>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Fill in what you know about the product below to compile a 6-frame storyboard prompt for video tools like Google
          Flow, Runway, or Kling. Leave a section blank and the studio will fill it in with something cohesive, or click
          AI Auto-Fill to have every remaining blank suggested for you.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 gap-5">
        <SectionShell number={1} title="Product Reference Image" subtitle="Attached as-is alongside the prompt — required." mode={null} count={productImage ? 1 : 0}>
          {!productImage ? (
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-6 text-sm text-zinc-400 hover:border-fuchsia-400/40 hover:text-zinc-300 cursor-pointer transition-colors">
              <ImagePlus className="w-4.5 h-4.5" />
              <span>Upload product photo</span>
              <input ref={productFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
            </label>
          ) : (
            <div className="relative w-32 h-32">
              <img src={productImage} alt="Product reference" className="w-32 h-32 object-cover rounded-xl border border-zinc-800" />
              <button
                type="button"
                onClick={() => setProductImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-fuchsia-400/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </SectionShell>

        <SectionShell number={2} title="Product Name" mode={null} count={productName.trim() ? 1 : 0}>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Ultrun"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50"
          />
        </SectionShell>

        <SectionShell number={3} title="Category" mode="single" count={category && (category !== CUSTOM || categoryCustom.trim()) ? 1 : 0}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORY_OPTIONS.map((opt) => (
              <OptionButton key={opt} active={category === opt} onClick={() => toggleSingle(category, setCategory)(opt)}>
                {opt}
              </OptionButton>
            ))}
            <OptionButton active={category === CUSTOM} onClick={() => toggleSingle(category, setCategory)(CUSTOM)}>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Custom</span>
            </OptionButton>
          </div>
          {category === CUSTOM && <CustomTextRow value={categoryCustom} onChange={setCategoryCustom} placeholder="Describe the product category…" />}
        </SectionShell>

        <SectionShell number={4} title="Material / Finish" mode="single" count={material && (material !== CUSTOM || materialCustom.trim()) ? 1 : 0}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {MATERIAL_OPTIONS.map((opt) => (
              <OptionButton key={opt} active={material === opt} onClick={() => toggleSingle(material, setMaterial)(opt)}>
                {opt}
              </OptionButton>
            ))}
            <OptionButton active={material === CUSTOM} onClick={() => toggleSingle(material, setMaterial)(CUSTOM)}>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Custom</span>
            </OptionButton>
          </div>
          {material === CUSTOM && <CustomTextRow value={materialCustom} onChange={setMaterialCustom} placeholder="Describe the material/finish…" />}
        </SectionShell>

        <SectionShell number={5} title="Product Color(s)" mode="multi" count={productColors.length + (productColorsCustom.trim() ? 1 : 0)}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {COLOR_SWATCHES.map((c) => {
              const active = productColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleMulti(productColors, setProductColors)(c.name)}
                  className={`flex flex-col gap-2 rounded-xl border p-1.5 transition-all ${
                    active ? "border-fuchsia-400/60 bg-zinc-900" : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <ColorSwatch hex={c.hex} active={active} />
                  <span className="text-[11px] font-medium text-center leading-tight text-zinc-300">{c.name}</span>
                </button>
              );
            })}
          </div>
          <CustomTextRow value={productColorsCustom} onChange={setProductColorsCustom} placeholder="Add custom colors, comma-separated…" />
        </SectionShell>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_-25px_rgba(217,70,239,0.35)] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-zinc-500">06</span>
            <h3 className="text-base font-semibold text-zinc-100 tracking-tight">Key Features</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-3">Up to three. Leave any blank and the studio fills the gap.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input type="text" value={feature1} onChange={(e) => setFeature1(e.target.value)} placeholder="Feature 1" className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50" />
            <input type="text" value={feature2} onChange={(e) => setFeature2(e.target.value)} placeholder="Feature 2" className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50" />
            <input type="text" value={feature3} onChange={(e) => setFeature3(e.target.value)} placeholder="Feature 3" className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50" />
          </div>
        </section>

        <SectionShell number={7} title="Brand Name" mode={null} count={brandName.trim() ? 1 : 0}>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Ultrun (defaults to Product Name if left blank)"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50"
          />
        </SectionShell>

        <SectionShell number={8} title="Brand Tone / Mood" mode="single" count={tone && (tone !== CUSTOM || toneCustom.trim()) ? 1 : 0}>
          <div className="flex flex-wrap gap-2">
            {TONE_CHIPS.map((opt) => (
              <OptionButton key={opt} className="!px-3 !py-1.5 !text-xs !rounded-full" active={tone === opt} onClick={() => toggleSingle(tone, setTone)(opt)}>
                {opt}
              </OptionButton>
            ))}
            <OptionButton className="!px-3 !py-1.5 !text-xs !rounded-full" active={tone === CUSTOM} onClick={() => toggleSingle(tone, setTone)(CUSTOM)}>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Custom</span>
            </OptionButton>
          </div>
          {tone === CUSTOM && <CustomTextRow value={toneCustom} onChange={setToneCustom} placeholder="Describe the tone/mood…" />}
        </SectionShell>

        <SectionShell number={9} title="Target Audience" mode={null} count={targetAudience.trim() ? 1 : 0}>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. serious runners and everyday fitness enthusiasts"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50"
          />
        </SectionShell>

        <SectionShell number={10} title="Brand Color Palette" mode="multi" count={brandColors.length + (brandColorsCustom.trim() ? 1 : 0)}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {COLOR_SWATCHES.map((c) => {
              const active = brandColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleMulti(brandColors, setBrandColors)(c.name)}
                  className={`flex flex-col gap-2 rounded-xl border p-1.5 transition-all ${
                    active ? "border-fuchsia-400/60 bg-zinc-900" : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <ColorSwatch hex={c.hex} active={active} />
                  <span className="text-[11px] font-medium text-center leading-tight text-zinc-300">{c.name}</span>
                </button>
              );
            })}
          </div>
          <CustomTextRow value={brandColorsCustom} onChange={setBrandColorsCustom} placeholder="Add custom brand colors, comma-separated…" />
        </SectionShell>

        <SectionShell number={11} title="Tagline / CTA" mode={null} count={tagline.trim() ? 1 : 0}>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder='e.g. "Run Beyond Limits"'
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50"
          />
        </SectionShell>

        <SectionShell
          number={12}
          title="Background / Studio Style"
          subtitle="Pick a preset, describe your own, or upload a reference image to auto-describe."
          mode="single"
          count={sceneImage && sceneDescription.trim() ? 1 : background && (background !== CUSTOM || backgroundCustom.trim()) ? 1 : 0}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BACKGROUND_CHIPS.map((opt) => (
              <OptionButton
                key={opt}
                active={background === opt && !sceneImage}
                onClick={() => {
                  handleRemoveSceneImage();
                  toggleSingle(background, setBackground)(opt);
                }}
              >
                {opt}
              </OptionButton>
            ))}
            <OptionButton
              active={background === CUSTOM && !sceneImage}
              onClick={() => {
                handleRemoveSceneImage();
                toggleSingle(background, setBackground)(CUSTOM);
              }}
            >
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Custom</span>
            </OptionButton>
          </div>
          {background === CUSTOM && !sceneImage && <CustomTextRow value={backgroundCustom} onChange={setBackgroundCustom} placeholder="Describe the studio/background style…" />}

          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <p className="text-xs text-zinc-500 mb-2.5">Or upload a reference image — it'll be analyzed and used instead of the options above.</p>
            {!sceneImage ? (
              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-4 text-sm text-zinc-400 hover:border-fuchsia-400/40 hover:text-zinc-300 cursor-pointer transition-colors">
                <ImagePlus className="w-4.5 h-4.5" />
                <span>Upload studio/background reference</span>
                <input ref={sceneFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSceneImageUpload} />
              </label>
            ) : (
              <div className="flex gap-3 items-start">
                <div className="relative shrink-0">
                  <img src={sceneImage} alt="Uploaded background reference" className="w-24 h-24 object-cover rounded-xl border border-zinc-800" />
                  <button
                    type="button"
                    onClick={handleRemoveSceneImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-fuchsia-400/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  {isDescribingScene ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing reference…
                    </div>
                  ) : (
                    <>
                      <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 mb-1.5 block">Auto-generated description (editable)</label>
                      <textarea
                        value={sceneDescription}
                        onChange={(e) => setSceneDescription(e.target.value)}
                        rows={3}
                        placeholder="Description will appear here…"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 resize-none"
                      />
                    </>
                  )}
                  {describeError && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{describeError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SectionShell>

        <SectionShell number={13} title="Font Style" mode="single" count={font && (font !== CUSTOM || fontCustom.trim()) ? 1 : 0}>
          <div className="flex flex-wrap gap-2">
            {FONT_CHIPS.map((opt) => (
              <OptionButton key={opt} className="!px-3 !py-1.5 !text-xs !rounded-full" active={font === opt} onClick={() => toggleSingle(font, setFont)(opt)}>
                {opt}
              </OptionButton>
            ))}
            <OptionButton className="!px-3 !py-1.5 !text-xs !rounded-full" active={font === CUSTOM} onClick={() => toggleSingle(font, setFont)(CUSTOM)}>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Custom</span>
            </OptionButton>
          </div>
          {font === CUSTOM && <CustomTextRow value={fontCustom} onChange={setFontCustom} placeholder="Describe the font style…" />}
        </SectionShell>

        <SectionShell number={14} title="Text Color" mode="single" count={textColor && (textColor !== CUSTOM || textColorCustom.trim()) ? 1 : 0}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {COLOR_SWATCHES.map((c) => {
              const active = textColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleSingle(textColor, setTextColor)(c.name)}
                  className={`flex flex-col gap-2 rounded-xl border p-1.5 transition-all ${
                    active ? "border-fuchsia-400/60 bg-zinc-900" : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <ColorSwatch hex={c.hex} active={active} />
                  <span className="text-[11px] font-medium text-center leading-tight text-zinc-300">{c.name}</span>
                </button>
              );
            })}
          </div>
          {textColor === CUSTOM && <CustomTextRow value={textColorCustom} onChange={setTextColorCustom} placeholder="Describe the text color…" />}
        </SectionShell>

        <SectionShell number={15} title="Platform / Use Case" mode="multi" count={platform.length}>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_CHIPS.map((opt) => (
              <OptionButton key={opt} className="!px-3 !py-1.5 !text-xs !rounded-full" active={platform.includes(opt)} onClick={() => toggleMulti(platform, setPlatform)(opt)}>
                {opt}
              </OptionButton>
            ))}
          </div>
        </SectionShell>

        <SectionShell number={16} title="Aspect Ratio" mode="single" count={aspectRatio ? 1 : 0}>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {ASPECT_RATIOS.map((a) => {
              const active = aspectRatio === a.ratio;
              return (
                <button
                  key={a.ratio}
                  type="button"
                  onClick={() => toggleSingle(aspectRatio, setAspectRatio)(a.ratio)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all ${
                    active ? "border-transparent bg-gradient-to-br from-fuchsia-500/90 to-purple-600/90 text-white shadow-lg shadow-fuchsia-500/30" : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <AspectIcon ratio={a.ratio} active={active} />
                  <span className="text-[11px] font-semibold">{a.ratio}</span>
                  <span className="text-[10px] opacity-80 text-center leading-tight">{a.label}</span>
                </button>
              );
            })}
          </div>
        </SectionShell>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_-25px_rgba(217,70,239,0.35)] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-zinc-500">17</span>
            <h3 className="text-base font-semibold text-zinc-100 tracking-tight">Use-Case Scenario</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-3">Optional — left blank means omitted from frame 4, unless AI Auto-Fill suggests one.</p>
          <input
            type="text"
            value={useCaseScenario}
            onChange={(e) => setUseCaseScenario(e.target.value)}
            placeholder="e.g. mid-stride on a running track"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50"
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_-25px_rgba(217,70,239,0.35)] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-zinc-500">18</span>
            <h3 className="text-base font-semibold text-zinc-100 tracking-tight">Lifestyle / Environment Context</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-3">Optional — left blank means omitted from frame 5, unless AI Auto-Fill suggests one.</p>
          <input
            type="text"
            value={lifestyleContext}
            onChange={(e) => setLifestyleContext(e.target.value)}
            placeholder="e.g. an urban running scene at dawn"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50"
          />
        </section>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_-25px_rgba(217,70,239,0.35)] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-400" /> Final Storyboard Prompt</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-zinc-200 hover:border-white/20 transition-colors"
                >
                  {copyState === "copied" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copyState === "copied" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                ref={textareaRef}
                readOnly
                value={result.prompt}
                rows={16}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-zinc-200 leading-relaxed focus:outline-none resize-none"
              />
              {copyState === "manual" && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Clipboard access isn't available. Press <strong>Ctrl+C</strong> (Windows/Linux) or <strong>⌘+C</strong> (Mac) to copy manually — the text is already selected.</span>
                </div>
              )}
              {!productImage && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>No product reference image was uploaded — remember to attach one alongside this prompt when you use it.</span>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_50px_-25px_rgba(217,70,239,0.35)] p-5 sm:p-6">
              <h3 className="text-base font-semibold text-zinc-100 mb-4">Filled Gaps Summary</h3>
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300 mb-2">Your Choices</h4>
                {Object.keys(result.yourChoices).length === 0 ? (
                  <p className="text-xs text-zinc-500">Nothing entered manually — the studio filled every field.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {Object.entries(result.yourChoices).map(([k, v]) => (
                      <li key={k} className="text-xs text-zinc-300"><span className="text-zinc-500">{k}:</span> {v}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-300 mb-2">Studio Filled In</h4>
                {Object.keys(result.studioFilled).length === 0 ? (
                  <p className="text-xs text-zinc-500">Every field was set by you — nothing needed auto-filling.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {Object.entries(result.studioFilled).map(([k, v]) => (
                      <li key={k} className="text-xs text-zinc-300"><span className="text-zinc-500">{k}:</span> {v}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="text-sm text-zinc-400">
            <span className="font-semibold text-zinc-100">{totalSelected}</span> fields filled
            <span className="hidden sm:inline text-zinc-700"> · </span>
            <span className="hidden sm:inline text-zinc-600 text-xs">Showcase Studio</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-sm font-medium rounded-xl border border-white/10 px-3.5 py-2.5 text-zinc-300 hover:border-white/20 hover:bg-white/[0.06] transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isAutoFilling}
              title="Fill remaining blank fields using the product image and your existing selections"
              className="inline-flex items-center gap-1.5 text-sm font-medium rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-3.5 py-2.5 text-fuchsia-200 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/20 transition-colors disabled:opacity-70"
            >
              {isAutoFilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isAutoFilling ? "Auto-filling…" : "AI Auto-Fill"}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-5 py-2.5 text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 transition-all shadow-lg shadow-fuchsia-500/30 disabled:opacity-70"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? "Generating…" : "Generate Storyboard Prompt"}
            </button>
          </div>
        </div>
        {(autoFillError || autoFilledKeys.length > 0) && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 -mt-1">
            {autoFillError ? (
              <p className="text-xs text-amber-300">{autoFillError}</p>
            ) : (
              <p className="text-xs text-emerald-300">AI filled {autoFilledKeys.length} field{autoFilledKeys.length === 1 ? "" : "s"} — review and adjust anything before generating.</p>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
