// Placeholder "For My Wife" / "For My Kids" copy for the two demo chapters.
// This is scaffolding only — real content will come from running
// prompts/edit2-wife-pass.md and prompts/edit3-kids-pass.md across the actual
// chapter files, at which point this file goes away and the real sections get
// parsed straight out of each chapter's markdown instead.

export const demoContent: Record<string, { wife: string; kids: string }> = {
  ch01: {
    wife: `
      <p>Every system I build is secretly answering one question: what am I willing to
      make worse so something else gets better? Faster usually means harder to change
      later. Simpler to build now usually means slower under real load.</p>
      <p>Most of my job isn't writing code — it's deciding which of those trade-offs
      we're making on purpose, instead of by accident.</p>
    `,
    kids: `
      <p>Imagine you're packing a school bag. You could bring everything you own "just
      in case," but then it's too heavy to carry. Or you could pack light, but then
      you might not have what you need.</p>
      <p>There's no perfect bag. There's just the bag that's right for today. That's
      basically my whole job, but with computers instead of backpacks.</p>
    `,
  },
  ch04: {
    wife: `
      <p>Think of a TV remote. You press "volume up" and it just works — you don't
      need to know anything about the signal it sends or how the TV's speaker
      actually gets louder.</p>
      <p>That's an abstraction: a simple button that hides something complicated
      underneath. Good code has a lot of these "remotes." The trouble starts when
      someone builds a remote that hides <em>too much</em>, and you need to know what's
      inside anyway.</p>
    `,
    kids: `
      <p>You know how a video game controller has a "jump" button? You don't need to
      know how the game engine calculates gravity or draws your character in the
      air — you just press the button and your character jumps.</p>
      <p>That button is hiding a LOT of complicated stuff from you on purpose, so you
      can focus on playing the game instead of programming physics. That's the idea
      behind this whole chapter, just applied to code instead of games.</p>
    `,
  },
};
