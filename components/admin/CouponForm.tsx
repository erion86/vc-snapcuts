"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  createCouponClient,
  normalizeCouponCode,
  updateCouponClient,
} from "@/lib/firebase/coupons-client";
import type { Coupon, CouponAppliesTo, CouponInput, CouponType } from "@/types/coupon";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/30";

const labelClass = "block font-sans text-xs font-semibold text-ink mb-1.5";

interface CouponFormProps {
  coupon?: Coupon;
}

const defaultDates = () => {
  const start = new Date();
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  return {
    startsAt: start.toISOString().slice(0, 10),
    expiresAt: end.toISOString().slice(0, 10),
  };
};

const emptyForm: CouponInput = {
  code: "",
  type: "percent",
  value: 10,
  minSpend: 0,
  usageLimit: 100,
  perUserLimit: 1,
  ...defaultDates(),
  appliesTo: "all",
  targetIds: [],
  active: true,
};

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const isEdit = Boolean(coupon);

  const [form, setForm] = useState<CouponInput>(emptyForm);
  const [valueDisplay, setValueDisplay] = useState("10");
  const [minSpendPesos, setMinSpendPesos] = useState("0");
  const [targetIdsText, setTargetIdsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coupon) return;

    setForm(couponToForm(coupon));
    setValueDisplay(
      coupon.type === "percent"
        ? String(coupon.value)
        : String(coupon.value / 100)
    );
    setMinSpendPesos(String(coupon.minSpend / 100));
    setTargetIdsText(coupon.targetIds.join(", "));
  }, [coupon]);

  function couponToForm(c: Coupon): CouponInput {
    return {
      code: c.code,
      type: c.type,
      value: c.value,
      minSpend: c.minSpend,
      usageLimit: c.usageLimit,
      perUserLimit: c.perUserLimit,
      startsAt: c.startsAt.slice(0, 10),
      expiresAt: c.expiresAt.slice(0, 10),
      appliesTo: c.appliesTo,
      targetIds: c.targetIds,
      active: c.active,
    };
  }

  function updateField<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(type: CouponType) {
    updateField("type", type);
    if (type === "free_shipping") {
      updateField("value", 0);
      setValueDisplay("0");
    } else if (type === "percent") {
      updateField("value", 10);
      setValueDisplay("10");
    } else {
      updateField("value", 5000);
      setValueDisplay("50");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const code = normalizeCouponCode(form.code);
      if (!code) {
        throw new Error("Coupon code is required");
      }

      const minSpend = Math.round(parseFloat(minSpendPesos || "0") * 100);
      if (Number.isNaN(minSpend) || minSpend < 0) {
        throw new Error("Enter a valid minimum spend");
      }

      let value = 0;
      if (form.type === "percent") {
        value = Math.round(parseFloat(valueDisplay));
        if (Number.isNaN(value) || value <= 0 || value > 100) {
          throw new Error("Percent discount must be between 1 and 100");
        }
      } else if (form.type === "fixed") {
        value = Math.round(parseFloat(valueDisplay || "0") * 100);
        if (Number.isNaN(value) || value <= 0) {
          throw new Error("Enter a valid discount amount");
        }
      }

      const usageLimit = Math.max(1, Math.round(form.usageLimit));
      const perUserLimit = Math.max(1, Math.round(form.perUserLimit));

      const payload: CouponInput = {
        ...form,
        code,
        value,
        minSpend,
        usageLimit,
        perUserLimit,
        startsAt: new Date(`${form.startsAt}T00:00:00.000Z`).toISOString(),
        expiresAt: new Date(`${form.expiresAt}T23:59:59.999Z`).toISOString(),
        targetIds: targetIdsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isEdit && coupon) {
        await updateCouponClient(coupon.code, payload);
        router.push("/admin/coupons");
        router.refresh();
      } else {
        await createCouponClient(payload);
        router.push("/admin/coupons");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-xl border border-sale/30 bg-sale/10 px-4 py-3 font-sans text-sm text-sale">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="code">
            Code
          </label>
          <input
            id="code"
            className={cn(inputClass, isEdit && "bg-surface-alt text-ink-soft")}
            value={form.code}
            onChange={(e) => updateField("code", e.target.value.toUpperCase())}
            placeholder="FIRST10"
            disabled={isEdit}
            required
          />
          {isEdit && (
            <p className="mt-1 font-sans text-xs text-ink-soft">Code cannot be changed after creation.</p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="type">
            Type
          </label>
          <select
            id="type"
            className={inputClass}
            value={form.type}
            onChange={(e) => handleTypeChange(e.target.value as CouponType)}
          >
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="free_shipping">Free shipping</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {form.type !== "free_shipping" && (
          <div>
            <label className={labelClass} htmlFor="value">
              {form.type === "percent" ? "Discount (%)" : "Discount (₱)"}
            </label>
            <input
              id="value"
              type="number"
              min={form.type === "percent" ? 1 : 0}
              max={form.type === "percent" ? 100 : undefined}
              step={form.type === "percent" ? 1 : 0.01}
              className={inputClass}
              value={valueDisplay}
              onChange={(e) => setValueDisplay(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="minSpend">
            Minimum spend (₱)
          </label>
          <input
            id="minSpend"
            type="number"
            min={0}
            step={0.01}
            className={inputClass}
            value={minSpendPesos}
            onChange={(e) => setMinSpendPesos(e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="usageLimit">
            Total usage limit
          </label>
          <input
            id="usageLimit"
            type="number"
            min={1}
            className={inputClass}
            value={form.usageLimit}
            onChange={(e) => updateField("usageLimit", Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="perUserLimit">
            Per-customer limit
          </label>
          <input
            id="perUserLimit"
            type="number"
            min={1}
            className={inputClass}
            value={form.perUserLimit}
            onChange={(e) => updateField("perUserLimit", Number(e.target.value))}
            required
          />
        </div>
      </div>

      {isEdit && coupon && (
        <p className="font-sans text-sm text-ink-soft">
          Used {coupon.usedCount} of {coupon.usageLimit} times
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="startsAt">
            Starts
          </label>
          <input
            id="startsAt"
            type="date"
            className={inputClass}
            value={form.startsAt}
            onChange={(e) => updateField("startsAt", e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="expiresAt">
            Expires
          </label>
          <input
            id="expiresAt"
            type="date"
            className={inputClass}
            value={form.expiresAt}
            onChange={(e) => updateField("expiresAt", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="appliesTo">
            Applies to
          </label>
          <select
            id="appliesTo"
            className={inputClass}
            value={form.appliesTo}
            onChange={(e) => updateField("appliesTo", e.target.value as CouponAppliesTo)}
          >
            <option value="all">All products</option>
            <option value="category">Specific categories</option>
            <option value="product">Specific products</option>
          </select>
        </div>

        {form.appliesTo !== "all" && (
          <div>
            <label className={labelClass} htmlFor="targetIds">
              {form.appliesTo === "category" ? "Category slugs" : "Product IDs"}
            </label>
            <input
              id="targetIds"
              className={inputClass}
              value={targetIdsText}
              onChange={(e) => setTargetIdsText(e.target.value)}
              placeholder="planners, stickers"
            />
          </div>
        )}
      </div>

      <label className="inline-flex items-center gap-2 font-sans text-sm text-ink cursor-pointer">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => updateField("active", e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary/30"
        />
        Active (customers can use this code)
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create coupon"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/coupons">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
