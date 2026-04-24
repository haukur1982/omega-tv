/**
 * ArticleContent — renders an article body in the vellum reading frame.
 *
 * Supports two content shapes:
 *   1. Admin-authored HTML (contains `<p`, `<h2`, etc.) — rendered via
 *      dangerouslySetInnerHTML on `.article-prose`. Trust boundary: the
 *      content field is written by Omega admins through the admin portal.
 *      It never accepts user input.
 *   2. Plain text with paragraph breaks (\n\n) — each paragraph becomes
 *      a <p>, and paragraphs starting with « are rendered as blockquotes
 *      (matches the Icelandic Scripture-quote convention throughout
 *      Hawk's article corpus).
 *
 * All typography (drop cap, line-height, blockquote styling, em color,
 * link color) comes from the `.article-reading-frame .article-prose`
 * rules in globals.css. This component is the semantic wrapper; the
 * visual design is in CSS.
 */

interface Props {
    content: string;
}

export default function ArticleContent({ content }: Props) {
    const isHtml = content.includes('<p') || content.includes('<h2') || content.includes('<h3');

    if (isHtml) {
        return (
            <div
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    const paragraphs = content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

    return (
        <div className="article-prose">
            {paragraphs.map((para, i) => {
                if (para.startsWith('«') || para.startsWith('„')) {
                    return <blockquote key={i}><p>{para}</p></blockquote>;
                }
                return <p key={i}>{para}</p>;
            })}
        </div>
    );
}
