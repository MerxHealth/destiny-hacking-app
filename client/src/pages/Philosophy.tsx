import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvictusFooter } from "@/components/InvictusFooter";
import {
  PROLOGUE_PARAGRAPHS,
  HIGHLIGHT_PHRASES,
  MARCUS_AURELIUS_QUOTE,
} from "../../../shared/prologue";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Highlights specific key phrases within a paragraph by wrapping them
 * in styled spans. The Marcus Aurelius quote gets special blockquote treatment.
 */
function HighlightedParagraph({
  text,
  index,
  lang,
}: {
  text: string;
  index: number;
  lang: "en" | "pt";
}) {
  const isLastParagraph = index === PROLOGUE_PARAGRAPHS.length - 1;
  const isMarcusAureliusParagraph = index === 5;

  const phrases = HIGHLIGHT_PHRASES.map((h) => h[lang]);

  // Extract the Marcus Aurelius quote for blockquote treatment
  if (isMarcusAureliusParagraph) {
    const quoteText = `"${MARCUS_AURELIUS_QUOTE[lang]}"`;
    const parts = text.split(quoteText);
    const beforeQuote = parts[0] || "";
    const afterQuote = parts[1] || "";

    return (
      <div className="space-y-6">
        <p className="text-lg md:text-xl leading-relaxed text-foreground/90">
          {renderSegments(splitWithHighlights(beforeQuote, phrases))}
        </p>
        <blockquote className="border-l-4 border-[#01D98D] pl-6 py-4 my-8">
          <p className="text-xl md:text-2xl leading-relaxed italic text-foreground/95 font-medium">
            {quoteText}
          </p>
          <cite className="block mt-3 text-sm text-muted-foreground not-italic">
            — Marcus Aurelius
          </cite>
        </blockquote>
        <p className="text-lg md:text-xl leading-relaxed text-foreground/90">
          {renderSegments(splitWithHighlights(afterQuote, phrases))}
        </p>
      </div>
    );
  }

  // Last paragraph gets special treatment
  if (isLastParagraph) {
    const finalSentence =
      lang === "pt"
        ? "Tudo o que resta é decidires."
        : "All that remains is for you to decide.";
    const beforeFinal = text.replace(finalSentence, "");

    return (
      <div>
        <p className="text-xl md:text-2xl leading-relaxed text-foreground/90">
          {renderSegments(splitWithHighlights(beforeFinal, phrases))}
          <span className="text-[#01D98D] font-bold">{finalSentence}</span>
        </p>
      </div>
    );
  }

  const segments = splitWithHighlights(text, phrases);

  return (
    <p className="text-lg md:text-xl leading-relaxed text-foreground/90">
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <span key={i} className="text-[#01D98D] font-semibold">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  );
}

function splitWithHighlights(
  text: string,
  phrases: readonly string[]
): Array<{ text: string; highlighted: boolean }> {
  let segments: Array<{ text: string; highlighted: boolean }> = [
    { text, highlighted: false },
  ];
  for (const phrase of phrases) {
    const newSegments: typeof segments = [];
    for (const seg of segments) {
      if (seg.highlighted) {
        newSegments.push(seg);
        continue;
      }
      const parts = seg.text.split(phrase);
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) newSegments.push({ text: parts[i], highlighted: false });
        if (i < parts.length - 1)
          newSegments.push({ text: phrase, highlighted: true });
      }
    }
    segments = newSegments;
  }
  return segments;
}

function renderSegments(
  segments: Array<{ text: string; highlighted: boolean }>
) {
  return segments.map((seg, i) =>
    seg.highlighted ? (
      <span key={i} className="text-[#01D98D] font-semibold">
        {seg.text}
      </span>
    ) : (
      <span key={i}>{seg.text}</span>
    )
  );
}

export default function Philosophy() {
  const { t, language } = useLanguage();
  const lang = language === "pt" ? "pt" : "en";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        className="relative py-16 md:py-24 px-4"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.15 0.02 160) 0%, oklch(0.13 0.01 160) 60%, var(--background) 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {t("Back", "Voltar")}
            </button>
          </Link>
          <motion.h1
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("The Philosophy", "A Filosofia")}
          </motion.h1>
          <motion.p
            className="text-lg text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {t("Why This App Exists", "Porque Esta App Existe")}
          </motion.p>
        </div>
      </motion.div>

      {/* Prologue Paragraphs */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        {PROLOGUE_PARAGRAPHS.map((paragraph, index) => (
          <motion.div
            key={index}
            className="py-8 md:py-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <HighlightedParagraph text={paragraph[lang]} index={index} lang={lang} />
          </motion.div>
        ))}

        {/* Divider */}
        <motion.div
          className="flex items-center justify-center py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-px w-24 bg-[#01D98D]/30" />
          <div className="mx-4 text-[#01D98D]/50 text-lg">✦</div>
          <div className="h-px w-24 bg-[#01D98D]/30" />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/sliders">
            <Button
              size="lg"
              className="bg-[#01D98D] hover:bg-[#01D98D]/90 text-black font-semibold text-lg px-8 py-6"
            >
              {t("Begin Calibrating", "Começar a Calibrar")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <InvictusFooter />
    </div>
  );
}
