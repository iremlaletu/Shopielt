"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsSort } from "@/wix-api/products";
import { collections } from "@wix/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";

interface SearchFilterLayoutProps {
  collections: collections.Collection[];
  children: React.ReactNode;
}

export default function SearchFilterLayout({
  collections,
  children,
}: SearchFilterLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // we can update together without losing info
  const [optimisticFilters, setOptimisticFilters] = useOptimistic({
    collection: searchParams.getAll("collection"),
    price_min: searchParams.get("price_min") || undefined,
    price_max: searchParams.get("price_max") || undefined,
    sort: searchParams.get("sort") || undefined,
  });

  const [isPending, startTransition] = useTransition();

  function updateFilters(updates: Partial<typeof optimisticFilters>) {
    // partial update makes these values(above) optional we can update one or combination of them
    const newState = { ...optimisticFilters, ...updates };
    const newSearchParams = new URLSearchParams(searchParams);

    // clear existing collection filters update with new ones

    Object.entries(newState).forEach(([key, value]) => {
      newSearchParams.delete(key);

      if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      } else if (value) {
        newSearchParams.set(key, value);
      }
    });

    newSearchParams.delete("page");

    // set optimistic state and navigate so we can show it on screen immediately
    startTransition(() => {
      setOptimisticFilters(newState);
      router.push(`?${newSearchParams.toString()}`);
    });
  }

  return (
    <main
      data-pending={isPending ? "" : undefined}
      className="flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start"
    >
      <aside className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64">
        <CollectionsFilter
          collections={collections}
          selectedCollectionIds={optimisticFilters.collection}
          updateCollectionIds={(collectionIds) =>
            updateFilters({ collection: collectionIds }) // expect an object
          }
        />
        <PriceFilter
          minDefaultInput={optimisticFilters.price_min}
          maxDefaultInput={optimisticFilters.price_max}
          updatePriceRange={(priceMin, priceMax) =>
            updateFilters({
              price_min: priceMin,
              price_max: priceMax,
            })
          }
        />
        <SortFilter
            sort={optimisticFilters.sort}
            updateSort={(sort) => updateFilters({ sort })}
          />
      </aside>
      <div className="w-full max-w-7xl space-y-5">
        
        {children}
      </div>
    </main>
  );
}

{ /* ** Collection filter component ** */ } 


interface CollectionsFilterProps {
  collections: collections.Collection[];
  selectedCollectionIds: string[];
  updateCollectionIds: (collectionIds: string[]) => void;
}

function CollectionsFilter({
  collections,
  selectedCollectionIds,
  updateCollectionIds,
}: CollectionsFilterProps) {
  return (
    <div className="space-y-3">
      <p className="font-bold">Collections</p>
      <ul className="space-y-1.5">
        {collections.map((collection) => {
          const collectionId = collection._id;
          if (!collectionId) return null;
          return (
            <li key={collectionId}>
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <Checkbox
                  id={collectionId}
                  checked={selectedCollectionIds.includes(collectionId)}
                  onCheckedChange={(checked) => {
                    updateCollectionIds(
                      checked
                        ? [...selectedCollectionIds, collectionId]
                        : selectedCollectionIds.filter(
                            (id) => id !== collectionId,
                          ),
                    );
                  }}
                />
                <span className="line-clamp-1 break-all">
                  {collection.name}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {selectedCollectionIds.length > 0 && (
        <Button className="w-full"
          onClick={() => updateCollectionIds([])} 
        >
          Clear
        </Button>
      )}
    </div>
  );
}

{ /* ** Price filter component ** */ } 

interface PriceFilterProps {
  minDefaultInput: string | undefined;
  maxDefaultInput: string | undefined;
  updatePriceRange: (min: string | undefined, max: string | undefined) => void;
}

function PriceFilter({
  minDefaultInput,
  maxDefaultInput,
  updatePriceRange,
}: PriceFilterProps) {
  const [minInput, setMinInput] = useState(minDefaultInput);
  const [maxInput, setMaxInput] = useState(maxDefaultInput);

  // this resets the input fields when the default props change
  useEffect(() => {
    setMinInput(minDefaultInput || ""); // when cleared, set to empty string
    setMaxInput(maxDefaultInput || "");
  }, [minDefaultInput, maxDefaultInput]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    updatePriceRange(minInput, maxInput);
  }

  return (
    <div className="space-y-3">
      <div className="font-bold">Price range</div>
      <form className="space-y-2" onSubmit={onSubmit}>
        <div className="flex items-center gap-2">
          <Input
          type="number"
          name="min"
          placeholder="Min"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          className="w-24"
        />
        <span>-</span>
        <Input
          type="number"
          name="max"
          placeholder="Max"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          className="w-24"
        />
        </div>
        <Button className="w-full" type="submit">Apply</Button>
      </form>
      {(!!minDefaultInput || !!maxDefaultInput) && (
        <Button className="w-full"
          onClick={() => updatePriceRange(undefined, undefined)} 
        >
          Clear
        </Button>
      )}
    </div>
  );
}

{ /* ** Sort filter component ** */ } 

interface SortFilterProps {
  sort: string | undefined;
  updateSort: (value: ProductsSort) => void; // productsSort type from wix-api/products
}

function SortFilter({ sort, updateSort }: SortFilterProps) {
  return (
    <Select value={sort || "last_updated"} onValueChange={updateSort}>
      <SelectTrigger className="w-full gap-2 text-start">
        <span>
          Sort by: <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last_updated">Newest</SelectItem>
        <SelectItem value="price_asc">Price (Low to high)</SelectItem>
        <SelectItem value="price_desc">Price (High to low)</SelectItem>
      </SelectContent>
    </Select>
  );
}
