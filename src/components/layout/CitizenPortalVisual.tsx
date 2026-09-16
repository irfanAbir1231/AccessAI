export function CitizenPortalVisual({ bn }: { readonly bn: boolean }) {
  return (
    <div className="portal-citizen-vector" role="img" aria-label={bn ? 'নাগরিকদের কাজ ও সহায়তার অ্যানিমেটেড ভেক্টর চিত্র' : 'Animated illustration of citizens working and finding support'}>
      <svg viewBox="0 0 640 560" fill="none" className="portal-citizen-scene" aria-hidden="true">
        <defs>
          <linearGradient id="citizen-platform" x1="100" y1="350" x2="550" y2="500" gradientUnits="userSpaceOnUse"><stop stopColor="#C2EFE2"/><stop offset="1" stopColor="#5BB59E"/></linearGradient>
          <linearGradient id="citizen-phone" x1="270" y1="100" x2="420" y2="410" gradientUnits="userSpaceOnUse"><stop stopColor="#61BBA6"/><stop offset="1" stopColor="#176B4D"/></linearGradient>
          <linearGradient id="citizen-shirt" x1="150" y1="260" x2="230" y2="370" gradientUnits="userSpaceOnUse"><stop stopColor="#FFB6A4"/><stop offset="1" stopColor="#E97868"/></linearGradient>
          <filter id="citizen-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#164B3C" floodOpacity=".15"/></filter>
        </defs>
        <ellipse cx="330" cy="280" rx="248" ry="222" fill="#75CDB2" opacity=".08"/>
        <ellipse cx="330" cy="458" rx="230" ry="38" fill="#176B4D" opacity=".08"/>
        <path d="M90 384L325 277L566 388V415L329 521L90 411Z" fill="#3D9B81"/>
        <path d="M90 384L325 277L566 388L329 495Z" fill="url(#citizen-platform)"/>
        <path d="M329 495V521L566 415V388Z" fill="#26856C"/>
        <path d="M158 383L329 460L497 385" stroke="white" strokeOpacity=".45" strokeWidth="2" strokeDasharray="7 9"/>
        <g className="citizen-phone-float" filter="url(#citizen-shadow)">
          <path d="M285 105L407 143C418 147 424 154 424 166V377C424 389 417 396 407 392L285 350C274 346 270 338 270 326V120C270 108 275 102 285 105Z" fill="#155B47"/>
          <path d="M272 100L394 138C405 142 411 150 411 161V373C411 385 404 391 394 387L272 346C261 342 256 333 256 322V115C256 103 262 97 272 100Z" fill="url(#citizen-phone)"/>
          <path d="M274 126L393 164V348L274 309Z" fill="#F2FCF7"/>
          <path d="M313 126L350 138" stroke="#C7EEE2" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="333" cy="353" rx="7" ry="9" transform="rotate(-17 333 353)" fill="#94D9C3"/>
          <path d="M298 186L361 207V252L298 231Z" fill="#4BAA90"/>
          <path d="M316 210L327 224L346 211" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M294 257L371 282M294 273L351 292" stroke="#B1DCCD" strokeWidth="7" strokeLinecap="round"/>
        </g>
        <g className="citizen-worker-sway">
          <path d="M175 358L170 424L187 431L199 369M203 369L219 421L236 417L225 350" fill="#254E49"/>
          <path d="M168 423L185 429L185 440L157 431C153 428 157 424 168 423ZM219 419L235 414L247 427L220 433Z" fill="#163B35"/>
          <path d="M160 280C172 266 205 265 220 284L233 352L202 375L163 355Z" fill="url(#citizen-shirt)"/>
          <path d="M214 289L242 319L274 298" stroke="#BE8264" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M166 296L149 333L173 348" stroke="#BE8264" strokeWidth="14" strokeLinecap="round"/>
          <path d="M178 260V279L197 286L202 263" fill="#BE8264"/>
          <ellipse cx="191" cy="244" rx="23" ry="28" fill="#DDA17E"/>
          <path d="M168 245C159 211 207 202 215 232L201 228L187 235L170 231Z" fill="#244E43"/>
          <path d="M174 282L185 344L204 360" stroke="#FFD4C7" strokeWidth="4"/>
        </g>
        <g>
          <path d="M447 352L438 419L453 426L470 363M473 363L490 415L505 408L494 347" fill="#244E43"/>
          <path d="M435 418L452 424L450 436L425 427ZM490 413L505 407L518 420L493 430Z" fill="#163B35"/>
          <path d="M439 271C453 261 476 266 486 282L501 350L468 372L437 350Z" fill="#3D9F89"/>
          <path d="M446 286L422 319L399 297" stroke="#C58B6A" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M482 293L503 322L481 339" stroke="#C58B6A" strokeWidth="13" strokeLinecap="round"/>
          <ellipse cx="463" cy="247" rx="22" ry="27" fill="#DDA17E"/>
          <path d="M437 259C428 216 478 207 487 244L478 288L466 272L478 249L467 231L447 239L451 280L433 278Z" fill="#F2C565"/>
          <path d="M450 291L465 355" stroke="#91D9C2" strokeWidth="4"/>
        </g>
        <g className="citizen-card-float" filter="url(#citizen-shadow)">
          <rect x="100" y="135" width="126" height="84" rx="18" fill="#F6FFFB"/>
          <rect x="100" y="207" width="126" height="12" rx="6" fill="#C3E8DA"/>
          <path d="M120 172L146 158L172 172V194H120Z" fill="#58AF96"/>
          <path d="M141 194V178H151V194" stroke="white" strokeWidth="4"/>
          <path d="M187 165H209M187 178H202" stroke="#9BCDBB" strokeWidth="5" strokeLinecap="round"/>
        </g>
        <g className="citizen-card-float citizen-card-delayed" filter="url(#citizen-shadow)">
          <rect x="446" y="119" width="111" height="83" rx="18" fill="#F6FFFB"/>
          <path d="M467 146H488V171H467Z" fill="#EF9785"/>
          <path d="M477 139V179M459 159H496" stroke="#EF9785" strokeWidth="9" strokeLinecap="round"/>
          <path d="M513 145H537M513 158H533M513 171H525" stroke="#9BCDBB" strokeWidth="5" strokeLinecap="round"/>
        </g>
        <g className="citizen-sparkle" stroke="#51AC91" strokeWidth="3" strokeLinecap="round"><path d="M227 81V99M218 90H236M542 282V300M533 291H551"/></g>
        <circle cx="123" cy="277" r="6" fill="#EF9785"/><circle cx="454" cy="79" r="5" fill="#F2C565"/>
      </svg>
    </div>
  );
}
