import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/primitives";
import { platformIcon } from "@/components/site/PlatformIcons";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";

type Draft = {
  id?: Id<"music_links">;
  platform: "youtube" | "spotify";
  title: string;
  subtitle: string;
  url: string;
  order: number;
  visible: boolean;
};

export default function AdminMusic() {
  const { token } = useAuth();
  const content = useQuery(api.adminContent.adminContent, token ? { token } : "skip");
  const upsert = useMutation(api.adminContent.upsertMusicLink);
  const remove = useMutation(api.adminContent.deleteMusicLink);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!content || loaded) return;
    setDrafts(
      content.music.map((entry) => ({
        id: entry._id,
        platform: entry.platform,
        title: entry.title,
        subtitle: entry.subtitle ?? "",
        url: entry.url,
        order: entry.order,
        visible: entry.visible,
      })),
    );
    setLoaded(true);
  }, [content, loaded]);

  const persist = async (draft: Draft) => {
    if (!token) return;
    setBusy(true);
    try {
      await upsert({
        token,
        id: draft.id,
        platform: draft.platform,
        title: draft.title,
        subtitle: draft.subtitle || undefined,
        url: draft.url,
        order: draft.order,
        visible: draft.visible,
      });
      toast.success("Music link saved — live on the storefront now");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that link");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="CONTENT"
        title="MUSIC"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setDrafts((current) => [
                ...current,
                {
                  platform: "youtube",
                  title: "WATCH ON YOUTUBE",
                  subtitle: "",
                  url: "https://",
                  order: current.length + 1,
                  visible: true,
                },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" /> ADD LINK
          </Button>
        }
      />

      <p className="border border-white/10 px-4 py-3.5 text-[12px] leading-relaxed text-white/45">
        The YouTube and Spotify marks on the storefront are official platform icons and stay fixed —
        you control the destination URL, the headline and the supporting line.
      </p>

      {drafts.length === 0 ? (
        <Panel>
          <p className="py-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            NO MUSIC LINKS YET — ADD ONE
          </p>
        </Panel>
      ) : null}

      {drafts.map((draft, index) => (
        <Panel
          key={draft.id ?? `new-${index}`}
          title={draft.platform === "youtube" ? "YOUTUBE" : "SPOTIFY"}
          actions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setDrafts((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, visible: !item.visible } : item,
                    ),
                  )
                }
                className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-white"
              >
                {draft.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {draft.visible ? "VISIBLE" : "HIDDEN"}
              </button>
              {draft.id ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (!token || !window.confirm("Delete this link?")) return;
                    await remove({ token, id: draft.id! });
                    setDrafts((current) => current.filter((_, i) => i !== index));
                    toast.success("Link deleted");
                  }}
                  className="text-white/40 transition-colors hover:text-red-batel"
                  aria-label="Delete link"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          }
        >
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-white text-black">
              {platformIcon(draft.platform, { className: "h-8 w-8" })}
            </div>

            <div className="grid flex-1 gap-5 sm:grid-cols-2">
              <Field label="PLATFORM">
                <Select
                  value={draft.platform}
                  onChange={(event) =>
                    setDrafts((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, platform: event.target.value as Draft["platform"] }
                          : item,
                      ),
                    )
                  }
                >
                  <option value="youtube">YouTube</option>
                  <option value="spotify">Spotify</option>
                </Select>
              </Field>
              <Field label="BUTTON LABEL">
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    setDrafts((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, title: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="WATCH ON YOUTUBE"
                />
              </Field>
              <Field label="SUPPORTING LINE" className="sm:col-span-2">
                <Input
                  value={draft.subtitle}
                  onChange={(event) =>
                    setDrafts((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, subtitle: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Official videos, visualisers and studio footage."
                />
              </Field>
              <Field label="URL" className="sm:col-span-2" hint="Where the button sends visitors.">
                <Input
                  value={draft.url}
                  onChange={(event) =>
                    setDrafts((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, url: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="https://www.youtube.com/@elbatel"
                />
              </Field>
              <Field label="DISPLAY ORDER">
                <Input
                  type="number"
                  value={draft.order}
                  onChange={(event) =>
                    setDrafts((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, order: Number(event.target.value) } : item,
                      ),
                    )
                  }
                />
              </Field>
              <div className="flex items-end gap-4">
                <Switch
                  checked={draft.visible}
                  onCheckedChange={(value) =>
                    setDrafts((current) =>
                      current.map((item, i) => (i === index ? { ...item, visible: value } : item)),
                    )
                  }
                />
                <Button size="sm" disabled={busy} onClick={() => void persist(draft)}>
                  {busy ? "SAVING…" : "SAVE LINK"}
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
