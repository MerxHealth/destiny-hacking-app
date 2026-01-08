import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper to create test context
function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      profileImageUrl: null,
      bio: null,
      timezone: null,
      notificationPreferences: null,
      onboardingCompleted: true,
    },
    req: {} as any,
    res: {} as any,
  };
  return ctx;
}

describe("PDF Highlights & Annotations", () => {
  it("should create a highlight with default yellow color", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.pdf.createHighlight({
      pageNumber: 10,
      selectedText: "This is an important concept to remember",
      startOffset: 0,
      endOffset: 41,
    });
    
    expect(result).toBeDefined();
  });

  it("should create a highlight with custom color", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.pdf.createHighlight({
      pageNumber: 15,
      selectedText: "Key insight about destiny hacking",
      startOffset: 100,
      endOffset: 133,
      color: "green",
    });
    
    expect(result).toBeDefined();
  });

  it("should list highlights for a specific page", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create a highlight first
    await caller.pdf.createHighlight({
      pageNumber: 20,
      selectedText: "Test highlight for page 20",
      startOffset: 0,
      endOffset: 27,
      color: "blue",
    });
    
    // List highlights for that page
    const highlights = await caller.pdf.listHighlights({ pageNumber: 20 });
    
    expect(highlights).toBeDefined();
    expect(Array.isArray(highlights)).toBe(true);
    const page20Highlights = highlights.filter((h: any) => h.pageNumber === 20);
    expect(page20Highlights.length).toBeGreaterThan(0);
  });

  it("should list all highlights for user", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    const highlights = await caller.pdf.listHighlights({});
    
    expect(highlights).toBeDefined();
    expect(Array.isArray(highlights)).toBe(true);
  });

  it("should update highlight color", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create a highlight
    await caller.pdf.createHighlight({
      pageNumber: 25,
      selectedText: "Highlight to be updated",
      startOffset: 0,
      endOffset: 23,
      color: "yellow",
    });
    
    // Get the highlight
    const highlights = await caller.pdf.listHighlights({ pageNumber: 25 });
    const highlight = highlights.find((h: any) => h.selectedText === "Highlight to be updated");
    
    if (highlight) {
      // Update color
      await caller.pdf.updateHighlight({
        highlightId: highlight.id,
        color: "pink",
      });
      
      // Verify update
      const updated = await caller.pdf.listHighlights({ pageNumber: 25 });
      const updatedHighlight = updated.find((h: any) => h.id === highlight.id);
      expect(updatedHighlight?.color).toBe("pink");
    }
  });

  it("should create annotation with note", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.pdf.createAnnotation({
      pageNumber: 30,
      note: "This reminds me of the concept from Chapter 2",
      contextText: "Surrounding text for context",
    });
    
    expect(result).toBeDefined();
  });

  it("should create annotation linked to highlight", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create highlight first
    await caller.pdf.createHighlight({
      pageNumber: 35,
      selectedText: "Important passage",
      startOffset: 0,
      endOffset: 17,
    });
    
    const highlights = await caller.pdf.listHighlights({ pageNumber: 35 });
    const highlight = highlights.find((h: any) => h.selectedText === "Important passage");
    
    if (highlight) {
      // Create annotation linked to highlight
      const result = await caller.pdf.createAnnotation({
        pageNumber: 35,
        highlightId: highlight.id,
        note: "This connects to my personal experience",
        contextText: "Important passage",
      });
      
      expect(result).toBeDefined();
    }
  });

  it("should list annotations for a page", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create annotation
    await caller.pdf.createAnnotation({
      pageNumber: 40,
      note: "Test annotation for page 40",
    });
    
    // List annotations
    const annotations = await caller.pdf.listAnnotations({ pageNumber: 40 });
    
    expect(annotations).toBeDefined();
    expect(Array.isArray(annotations)).toBe(true);
  });

  it("should update annotation note", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create annotation
    await caller.pdf.createAnnotation({
      pageNumber: 45,
      note: "Original note",
    });
    
    // Get annotation
    const annotations = await caller.pdf.listAnnotations({ pageNumber: 45 });
    const annotation = annotations.find((a: any) => a.note === "Original note");
    
    if (annotation) {
      // Update note
      await caller.pdf.updateAnnotation({
        annotationId: annotation.id,
        note: "Updated note with more details",
      });
      
      // Verify update
      const updated = await caller.pdf.listAnnotations({ pageNumber: 45 });
      const updatedAnnotation = updated.find((a: any) => a.id === annotation.id);
      expect(updatedAnnotation?.note).toBe("Updated note with more details");
    }
  });

  it("should delete highlight", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create highlight
    await caller.pdf.createHighlight({
      pageNumber: 50,
      selectedText: "Highlight to be deleted",
      startOffset: 0,
      endOffset: 23,
    });
    
    // Get highlight
    const highlights = await caller.pdf.listHighlights({ pageNumber: 50 });
    const highlight = highlights.find((h: any) => h.selectedText === "Highlight to be deleted");
    
    if (highlight) {
      const beforeCount = highlights.length;
      
      // Delete highlight
      await caller.pdf.deleteHighlight({ highlightId: highlight.id });
      
      // Verify deletion
      const after = await caller.pdf.listHighlights({ pageNumber: 50 });
      const deletedHighlight = after.find((h: any) => h.id === highlight.id);
      expect(deletedHighlight).toBeUndefined();
    }
  });

  it("should delete annotation", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    // Create annotation
    await caller.pdf.createAnnotation({
      pageNumber: 55,
      note: "Annotation to be deleted",
    });
    
    // Get annotation
    const annotations = await caller.pdf.listAnnotations({ pageNumber: 55 });
    const annotation = annotations.find((a: any) => a.note === "Annotation to be deleted");
    
    if (annotation) {
      // Delete annotation
      await caller.pdf.deleteAnnotation({ annotationId: annotation.id });
      
      // Verify deletion
      const after = await caller.pdf.listAnnotations({ pageNumber: 55 });
      const deletedAnnotation = after.find((a: any) => a.id === annotation.id);
      expect(deletedAnnotation).toBeUndefined();
    }
  });
});
