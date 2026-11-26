import * as React from "react";

/**
 * A kiválasztott érték felirata, a Select alá írt elemekből kiolvasva.
 *
 * Miért kell: a Select korábban egy `displayLabel` állapotban tárolta a feliratot,
 * amit kizárólag a SelectItem írt - kattintáskor, vagy egy beilleszkedéskor futó
 * effektben. A SelectItem-ek viszont csak nyitott listában vannak beillesztve
 * (`SelectContent`: `if (!open) return null`), ezért zárt listánál soha nem futott
 * le az effekt. Ennek két következménye volt:
 *   1. amit nem kattintással állítottak be (alapérték, "másolás a tulajdonostól"),
 *      az üresen látszott, pedig az érték tárolva volt;
 *   2. ami rosszabb: egy kattintás után beragadt felirat ott maradt a képernyőn,
 *      miközben az érték közben megváltozott - az ügyfél "Német"-et látott, a
 *      szerződésbe pedig "magyar" került.
 * A felirat ezért nem állapot többé, hanem az értékből származik.
 *
 * A keresés a React-elemfán megy végig, nem a DOM-on, így a zárt (be nem illesztett)
 * lista elemeit is megtalálja. Csak szöveges feliratú elemet fogad el; ha nincs
 * találat, a hívó a helykitöltőt mutatja, ahogy eddig is.
 */
export function labelForValue(
  children: React.ReactNode,
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  let found: string | undefined;

  const walk = (nodes: React.ReactNode): void => {
    React.Children.forEach(nodes, (child) => {
      if (found !== undefined) return;
      if (!React.isValidElement(child)) return;

      const props = child.props as { value?: unknown; children?: React.ReactNode };
      if (props.value === value && typeof props.children === "string") {
        found = props.children;
        return;
      }
      if (props.children !== undefined) walk(props.children);
    });
  };

  walk(children);
  return found;
}
