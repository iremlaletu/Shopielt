"use client";
import LoadingButton from "@/components/LoadingButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDeleteMemberAddresses, useMember, useUpdateMember } from "@/hooks/member";
import { formatDateTR, relativeDaysTR } from "@/lib/utils";
import { requiredString } from "@/lib/validation";
import { UpdateMemberInfoValues } from "@/wix-api/members";
import { zodResolver } from "@hookform/resolvers/zod";
import { members } from "@wix/members";
import { MapPin, Trash2, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z
  .object({
    loginEmail: requiredString,
    firstName: requiredString,
    lastName: requiredString,

    addressLine: z.string().trim().optional(),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    country: z.string().optional(),
    postalCode: z.string().trim().optional(),
  })
  .superRefine((vals, ctx) => {
    const anyAddressFilled =
      !!vals.addressLine ||
      !!vals.addressLine2 ||
      !!vals.city ||
      !!vals.country ||
      !!vals.postalCode;

    if (!anyAddressFilled) return;

    if (!vals.addressLine) {
      ctx.addIssue({
        code: "custom",
        path: ["addressLine"],
        message: "Required",
      });
    }
    if (!vals.city) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "Required" });
    }
    if (!vals.country) {
      ctx.addIssue({ code: "custom", path: ["country"], message: "Required" });
    }
    if (!vals.postalCode) {
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "Required",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface MemberInfoFormProps {
  member: members.Member;
}

const COUNTRY_OPTIONS = [
  { label: "Türkiye", value: "TR" },
  { label: "United States", value: "US" },
];

export default function MemberInfoForm({ member }: MemberInfoFormProps) {
  const { data: currentMember } = useMember(member);
  const memberData = currentMember ?? member;

  const primaryAddress = memberData?.contact?.addresses?.[0];
  const photoUrl = memberData?.profile?.photo?.url || "";
  const displayName =
    memberData?.contact?.firstName ||
    memberData?.profile?.nickname ||
    memberData?.loginEmail ||
    "User";
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginEmail: memberData?.loginEmail || "",
      firstName: memberData?.contact?.firstName || "",
      lastName: memberData?.contact?.lastName || "",
      addressLine: "",
      addressLine2: "",
      city: "",
      country: "",
      postalCode: "",
    },
  });

  const mutation = useUpdateMember();
  const deleteAddressMutation = useDeleteMemberAddresses();

  function onSubmit(values: FormValues) {
    const updatePayload: UpdateMemberInfoValues = {
      firstName: values.firstName,
      lastName: values.lastName,
      addressLine: values.addressLine,
      addressLine2: values.addressLine2,
      city: values.city,
      country: values.country,
      postalCode: values.postalCode,
    };

    mutation.mutate(updatePayload, {
      onSuccess: () => {
        form.reset({
          ...form.getValues(),
          addressLine: "",
          addressLine2: "",
          city: "",
          country: "",
          postalCode: "",
        });
      },
    });
  }

  const memberSince = formatDateTR((memberData as any)?._createdDate);
  const lastLoginDate = formatDateTR((memberData as any)?.lastLoginDate);
  const lastLoginRel = relativeDaysTR((memberData as any)?.lastLoginDate);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My account</h1>
          <p className="text-muted-foreground text-sm">
            Update your profile and manage your address.
          </p>
        </div>
        <Badge variant="secondary">Member</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* LEFT: summary card */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={photoUrl} alt={displayName} />
                <AvatarFallback>
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="truncate font-semibold">
                  {(memberData?.contact?.firstName || displayName) +
                    (memberData?.contact?.lastName
                      ? ` ${memberData.contact?.lastName}`
                      : "")}
                </div>
                <div className="text-muted-foreground truncate text-sm">
                  {memberData?.loginEmail}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {memberData?.activityStatus && (
                <Badge>{memberData.activityStatus}</Badge>
              )}
              {memberData?.status && (
                <Badge variant="secondary">{memberData.status}</Badge>
              )}
              {memberData?.loginEmailVerified && (
                <Badge variant="outline">Email verified</Badge>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{memberSince ?? "-"}</span>
              </div>

              {(lastLoginDate || lastLoginRel) && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last login</span>
                  <span className="font-medium">
                    {lastLoginDate ?? "-"}
                    {lastLoginRel && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({lastLoginRel})
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Saved address</span>
                <span className="font-medium">
                  {primaryAddress ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: forms */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* loginEmail */}
                <FormField
                  control={form.control}
                  name="loginEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login email</FormLabel>
                      <FormControl>
                        <Input type="email" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* first/last */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <LoadingButton type="submit" loading={mutation.isPending}>
                  Save changes
                </LoadingButton>
              </CardContent>
            </Card>

            {/* Saved address card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Saved address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryAddress ? (
                  // buraya en son yaptığımız "yatay adres + çöp ikon" kart içeriğini koy
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {primaryAddress.addressLine && (
                          <span className="text-foreground font-medium">
                            {primaryAddress.addressLine}
                          </span>
                        )}
                        {primaryAddress.country && (
                          <Badge variant="outline">
                            {primaryAddress.country}
                          </Badge>
                        )}
                      </div>

                      <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-1 text-sm">
                        {primaryAddress.addressLine2 && (
                          <span>{primaryAddress.addressLine2}</span>
                        )}
                        {(primaryAddress.postalCode || primaryAddress.city) && (
                          <span>
                            {[primaryAddress.postalCode, primaryAddress.city]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <LoadingButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      loading={deleteAddressMutation.isPending}
                      disabled={deleteAddressMutation.isPending}
                      onClick={() => {
                        deleteAddressMutation.mutate(undefined, {
                          onSuccess: () => {
                            form.setValue("addressLine", "");
                            form.setValue("addressLine2", "");
                            form.setValue("city", "");
                            form.setValue("country", "");
                            form.setValue("postalCode", "");
                          },
                        });
                      }}
                      aria-label="Delete address"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </LoadingButton>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center">
                    <p className="font-medium">No address saved</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Add an address to speed up checkout.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address form */}
            <Card>
              <CardHeader>
                <CardTitle>Update address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="addressLine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street, Avenue, Building No."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, Suite, Floor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <LoadingButton type="submit" loading={mutation.isPending}>
                  Save changes
                </LoadingButton>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
