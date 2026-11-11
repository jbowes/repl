import React from "react";

// static/favicon-32x32.png inlined so a page view makes no favicon request.
const icon =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACv0lEQVRYR+1XQUtiYRQ9zrIIt4kUURFaEVamBgVSKEUbk0AXgeDCwI0WGljjpqnBnVEwggt/gvui2im1iLAUF1FIhO3FIot4w72QNPVMLUdbdOFbvffde+5559zvfRJBEH4AWAHgBCBDfeIGwB8AvyWCIPwE8Ks+dd9U8ROAbB07f43ghgAIDeqey34D+PoM3N/fw2q1Yn5+HnNzczWXS1kG8vk8WlpasLGxgZUVGhe1DVEAT09PCIVCyGQyeHx8xNbWFsbGxqDVatHU1ASn04nW1taaIBEFEAgE4PP5ShYYHR1FPB7/fwCowOHhIVwuFxYWFtDb2wuv1wu9Xo+ZmRkunM1mIZN9fnKLMjAwMICzszP4/X4sLy8XNUDFCQTF8fExOjs7P82CKIBnBhYXF7G2tlZ/EQaDQSwtLXF3ExMTODg4KOuCaDSKzc1NmM1mmEwmdHR0VMSOKAN0PITDYayvr+P6+poTkQPIDRqNRjTx3t4eF769veXnQ0NDDGZ2dpY1VCrenQOFQoHtSJ/iOaanp7G9vY2urq43Oel9csfu7i6vk5MTUDMKhQJ2u52F/DrKDqJcLgepVIrx8XFcXFyw+pVKJVKpFCQSybs0n56eclEC09fXh2Qy+XEANAmNRiNGRkY4ydXVFdra2v5J+PDwgFgshp2dHV6JRIIZ6O/vZwZeMvm8UZQBg8GAdDoNt9sNh8PBDBCAqakpDA8P897z83N0d3cXAezv77MGaHQTM2q1mjVAq6enpzoN6HQ6HB0dwePx8Nglv6+urrIjJicnORmJUy6XFxOTC0ikJDpa7e3tH3cBqZ+GUKlQqVQssFqE6CegA4hmweXlJR9GkUiE7Tc4OIjm5mYe0ZV2WA5kxS6o63H8EvXd3R3/iNhsNlgslnINVf28LANVZ6xywzeAL8FAw69mDb+cNvR6/hfIln9+/4U8CQAAAABJRU5ErkJggg==";

export default () => (
  <>
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" href={icon} />
  </>
);
