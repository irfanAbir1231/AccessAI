import Image from 'next/image';

/** Shared decorative mark; adjacent brand text supplies the accessible name. */
export function BrandLogo({ size = 40 }: { readonly size?: number }) {
  return <Image src="/accessai-logo.svg" alt="" aria-hidden="true" width={size} height={size} className="shrink-0" />;
}
