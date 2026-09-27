import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/primitives";
import { platformIcon } from "@/components/site/PlatformIcons";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";

const PLATFORMS = ["instagram", "tiktok", "youtube", "spotify", "x", "other"];

type Draft = {
  id?: Id<"social_links">;
  platform: string;
  label: string;
  url: string;
  handle: string;
  order: number;
  visible: boolean;
};

export default function AdminSocials() {
  const { token } = useAuth();
  const content = useQuery(api.adminContent.adminContent, token ? { token } : "skip");
  const upsert = useMutation(api.adminContent.upsertSocialLink);
  const remove = useMutation(api.adminContent.deleteSocialLink);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!content || loaded) return;
    setDrafts(
      content.socials.map((social) => ({
        id: social._id,
        platform: social.platform,
        label: social.label,
        url: social.url,
        handle: social.handle ?? "",
        order: social.order,
        visible: social.visible,
      })),
    );
    setLoaded(true);
  }, [content, loaded]);

  const persist = async (draft: Draft, index: number) => {
    if (!token) return;
    setBusy(true);
    try {
      await upsert({
        token,
        id: draft.id,
        platform: draft.platform,
        label: draft.label,
        url: draft.url,
        handle: draft.handle || undefined,
        order: draft.order,
        visible: draft.visible,
      });
      toast.success(`${draft.label} saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that link");
    } finally {
      setBusy(false);
    }
  };

  const patch = (index: number, values: Partial<Draft>) =>
    setDrafts((current) => current.map((item, i) => (i === index ? { ...item, ...values } : item)));

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="CONTENT"
        title="SOCIAL LINKS"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setDrafts((current) => [
                ...current,
                {
                  platform: "instagram",
                  label: "Instagram",
                  url: "https://",
                  handle: "EL BATEL",
                  order: current.length + 1,
                  visible: true,
                },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" /> ADD PLATFORM
          </Button>
        }
      />

      <p className="border border-white/10 px-4 py-3.5 text-[12px] leading-relaxed text-white/45">
        These links feed the footer icons, the music page grid and the contact page — one place to
        change them all.
      </p>

      <div className="space-y-5">
        {drafts.map((draft, index) => (
          <Panel
            key={draft.id ?? `new-${index}`}
            title={draft.label || "NEW LINK"}
            actions={
              <div className="flex items-center gap-4">
                <Switch
                  checked={draft.visible}
                  onCheckedChange={(value) => patch(index, { visible: value })}
                />
                {draft.id ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!token || !window.confirm(`Delete ${draft.label}?`)) return;
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="PLATFORM">
                <Select
                  value={draft.platform}
                  onChange={(event) => patch(index, { platform: event.target.value })}
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="LABEL">
                <Input value={draft.label} onChange={(event) => patch(index, { label: event.target.value })} />
              </Field>
              <Field label="HANDLE">
                <Input
                  value={draft.handle}
                  onChange={(event) => patch(index, { handle: event.target.value })}
                  placeholder="EL BATEL"
                />
              </Field>
              <Field label="URL" className="sm:col-span-2">
                <Input
                  value={draft.url}
                  onChange={(event) => patch(index, { url: event.target.value })}
                  placeholder="https://www.instagram.com/…"
                />
              </Field>
              <Field label="ORDER">
                <Input
                  type="number"
                  value={draft.order}
                  onChange={(event) => patch(index, { order: Number(event.target.value) })}
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <span className="flex items-center gap-3 text-white/60">
                {platformIcon(draft.platform, { className: "h-5 w-5" })}
                <span className="font-mono text-[9px] uppercase tracking-[0.2em]">
                  PREVIEW ICON
                </span>
              </span>
              <Button size="sm" disabled={busy} onClick={() => void persist(draft, index)}>
                {busy ? "SAVING…" : "SAVE"}
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
