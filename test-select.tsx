import React from "react";
import { renderToString } from "react-dom/server";
import { Select as SelectPrimitive } from "@base-ui/react/select";

const Test = () => {
  return (
    <SelectPrimitive.Root value="1">
      <SelectPrimitive.Trigger>
        <SelectPrimitive.Value placeholder="Select one">
          One
        </SelectPrimitive.Value>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner>
          <SelectPrimitive.Popup>
            <SelectPrimitive.Item value="1">
              <SelectPrimitive.ItemText>One</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

console.log(renderToString(<Test />));
