import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";

export default function AdminAbout() {
  const { token } = useAuth();
  const content = useQuery(api.adminContent.adminContent, token ? { token } : "skip");
  const updateAbout = useMutation(api.adminContent.updateAbout);

  const [form, setForm] = useState({
    title: "",
    intro: "",
    body: "",
    statement: "",
    image: "",
    signature: "",
  });
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const about = content?.about;
    if (!about || loaded) return;
    setForm({
      title: about.title,
      intro: about.intro,
      body: about.body,
      statement: about.statement,
      image: about.image ?? "",
      signature: about.signature ?? "",
    });
    setLoaded(true);
  }, [content, loaded]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await updateAbout({
        token,
        title: form.title,
        intro: form.intro,
        body: form.body,
        statement: form.statement,
        image: form.image || null,
        signature: form.signature || null,
      });
      toast.success("Brand story updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the story");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="CONTENT" title="ABOUT EL BATEL" />

      <form onSubmit={save} className="space-y-6">
        <Panel
          title="BRAND STORY"
          description="This is the only place the about page copy lives — nothing is hard-coded in the storefront."
        >
          <div className="grid gap-5">
            <Field label="TITLE">
              <Input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="EL BATEL"
              />
            </Field>
            <Field label="INTRO" hint="Shown under the giant headline in the hero band.">
              <Textarea
                rows={3}
                value={form.intro}
                onChange={(event) => setForm({ ...form, intro: event.target.value })}
              />
            </Field>
            <Field label="BODY" hint="Separate paragraphs with a blank line.">
              <Textarea
                rows={10}
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
              />
            </Field>
            <Field label="STATEMENT" hint="The large pull-quote, e.g. NOT JUST CLOTHES. A PIECE OF THE CULTURE.">
              <Textarea
                rows={2}
                value={form.statement}
                onChange={(event) => setForm({ ...form, statement: event.target.value })}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="EDITORIAL IMAGE" hint="URL or art: preset.">
                <Input
                  value={form.image}
                  onChange={(event) => setForm({ ...form, image: event.target.value })}
                  placeholder="art:hoodie:black:front"
                />
              </Field>
              <Field label="SIGNATURE" hint="Signed under the statement.">
                <Input
                  value={form.signature}
                  onChange={(event) => setForm({ ...form, signature: event.target.value })}
                  placeholder="EL BATEL"
                />
              </Field>
            </div>
          </div>
        </Panel>

        <div className="sticky bottom-4 flex items-center gap-3 border border-white/12 bg-black/95 p-4 backdrop-blur">
          <Button type="submit" disabled={busy}>
            {busy ? "SAVING…" : "SAVE STORY"}
          </Button>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
            KEEP THE COPY FACTUAL — NO CLAIMS THE ARTIST DID NOT MAKE
          </p>
        </div>
      </form>
    </div>
  );
}
