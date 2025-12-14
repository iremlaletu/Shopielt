import { useCartCheckout } from "@/hooks/checkout";
import LoadingButton from "./LoadingButton";
import { Button } from "./ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

export default function CheckoutButton(props: ButtonProps) {
  const { startCheckoutFlow, pending } = useCartCheckout();

  return (
    <LoadingButton onClick={startCheckoutFlow} loading={pending} {...props}>
      Checkout
    </LoadingButton>
  );
}