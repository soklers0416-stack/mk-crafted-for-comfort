import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function SiteLightbox({
  open,
  index,
  images,
  onClose,
}: {
  open: boolean;
  index: number;
  images: string[];
  onClose: () => void;
}) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={images.map((src) => ({ src }))}
      animation={{ fade: 250 }}
      controller={{ closeOnBackdropClick: true }}
    />
  );
}
