// Edit developer names, roles, images and social links below.
// Images: put a file in public/images and use "/images/your-photo.webp".
// Set image to "" for initials. Omit a social link or set it to "" to hide it.
// Add/remove whole developer entries freely; keep each id unique.
export type Developer = {
  id: string;
  name: string;
  role: string;
  image: string;
  socials: Partial<Record<"github" | "facebook" | "instagram", string>>;
};

export const developers: Developer[] = [
  { id: "developer-1", name: "Eryck Jouhann V. Cadawas", role: "Decepticon", image: "/images/hojan.webp", socials: { github: "https://github.com/Hojannn", facebook: "https://www.facebook.com/jouhanncadawas", instagram: "https://www.instagram.com/hojaaann/?hl=en" } },
  { id: "developer-2", name: "Carl Jasper A. Ramos", role: "Backshot Developer", image: "/images/cj.webp", socials: { github: "https://github.com/zora-ao?fbclid=IwY2xjawVC_PtleHRuA2FlbQIxMQBwZG9mA3NydGMGYXBwX2lkATAAAR44MoM7B0RsS8slu3uZK2DWAcZQ65f8rh_KCKGQAl0CfuQe2-MFvG0nP7vqIQ_aem_YW85JSTpqUC9G7Bu-t_wHw", facebook: "https://www.facebook.com/carljaspera.ramos", instagram: "https://www.instagram.com/crldkl/" } },
  { id: "developer-3", name: "Dolf Louise P. Felipe", role: "Project Demo (Demolition)", image: "/images/dolf.webp", socials: { github: "https://github.com/aintlumii?fbclid=IwY2xjawVC_KtleHRuA2FlbQIxMQBwZG9mA3NydGMGYXBwX2lkATAAAR5eCTjynQr7KL4jq1t02_H6FMUrPd16Q_YqnkMU95QJO3RLQFzedAuVerYMsQ_aem_kly-EbMvYlZ_M92x-Qqlgw", facebook: "https://www.facebook.com/dolflouise.felipe", instagram: "https://www.instagram.com/aintlumi_?exln=MWxkdHJsd2MydXpxbA==" } },
];



export const aboutContent = {
  eyebrow: "ABOUT BOOKY",
  title: ["Your campus library,", "a little closer."],
  description: "Booky makes it easier to discover books, keep track of your borrows, and save the titles you want to read next—all in one place.",
  featuresTitle: "A simpler way to use your library",
  features: [
    { title: "Find your next read", description: "Browse the catalog, search for a title, and check book details and availability." },
    { title: "Stay on top of your borrows", description: "See due dates, overdue books, and your borrowing history in one clear view." },
    { title: "Keep your favorites close", description: "Save books for later and share your thoughts through ratings and reviews." },
  ],
  developersTitle: "Meet the developers",
  developersDescription: "The team building a better library experience.",
  footer: "Built to help students, librarians, and administrators stay connected to their library.",
};
