import * as React from "react";
import { Input, type InputProps } from "./Input";

export type SearchInputProps = Omit<InputProps, "type">;

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(props, ref) {
    return (
      <Input
        ref={ref}
        type="search"
        placeholder="Buscar..."
        {...props}
      />
    );
  }
);