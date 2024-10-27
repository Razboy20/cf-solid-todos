import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { Tooltip as KBTooltip, type TooltipRootProps, type TooltipTriggerProps } from "@kobalte/core/tooltip";
import type { JSX, ValidComponent } from "solid-js";
import { createSignal, splitProps } from "solid-js";
import { css } from "solid-styled";

type TooltipProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  TooltipTriggerProps<T> & {
    tooltipText: JSX.Element;
    placement?: TooltipRootProps["placement"];
    openDelay?: number;
  }
>;

export const Tooltip = <T extends ValidComponent = "button">(props: TooltipProps<T>) => {
  const [open, setOpen] = createSignal(false);

  const [local, others] = splitProps(props, ["tooltipText", "placement", "openDelay"]);

  css`
    .tooltip__content {
      transform-origin: var(--kb-tooltip-content-transform-origin);
      animation: fadeIn 0ms;
    }

    .tooltip__content[data-expanded] {
      animation: fadeIn 150ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.98);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  return (
    <KBTooltip onOpenChange={setOpen} placement={local.placement} openDelay={local.openDelay}>
      <KBTooltip.Trigger {...(others as unknown as PolymorphicProps<T, TooltipTriggerProps<T>>)}></KBTooltip.Trigger>
      <KBTooltip.Portal>
        <KBTooltip.Content
          class="tooltip__content z-10 inline-block max-w-sm border border-neutral-300 rounded-lg bg-white p-2 px-2.5 dark:(border-neutral-600 bg-neutral-700 text-neutral-100)"
          use:solid-styled
        >
          <KBTooltip.Arrow />
          <p>{local.tooltipText}</p>
        </KBTooltip.Content>
      </KBTooltip.Portal>
    </KBTooltip>
  );
};
