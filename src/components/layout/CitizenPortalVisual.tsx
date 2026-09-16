import Image from 'next/image';

export function CitizenPortalVisual({ bn }: { readonly bn: boolean }) {
  return (
    <div className="portal-government-photo" aria-hidden="true">
      <div className="portal-government-photo-frame">
        <Image src="/images/bangladesh-parliament.jpg" alt="" fill priority sizes="(min-width: 905px) 75vw, 100vw" className="portal-government-photo-image" />
      </div>
    </div>
  );
}
