"use client";

import React from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Package,  } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExpiryTimer from "@/components/ExpiryTimer";
import { Listing } from "@/lib/types";
import {  } from "@/lib/utils";

interface FoodCardProps {
  listing: Listing;
  index?: number;
  onClick?: () => void;
  showMatchScore?: boolean;
}

const foodTypeIcons: Record<string, string> = {
  cooked: "🍲",
  raw: "🥬",
  packaged: "📦",
  bakery: "🍞",
  dairy: "🧀",
  fruits: "🍎",
  other: "🍽️",
};

export default function FoodCard({
  listing,
  index = 0,
  onClick,
  showMatchScore = false,
}: FoodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-lg">
                {foodTypeIcons[listing.food_type] || "🍽️"}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{listing.food_name}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {listing.food_type}
                </p>
              </div>
            </div>
            <ExpiryTimer expiresAt={listing.expires_at} />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              <span>{listing.quantity_kg} kg</span>
            </div>
            <div className="flex items-center gap-1">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>{listing.meals} meals</span>
            </div>
            <Badge
              variant={listing.status === "available" ? "default" : "secondary"}
              className="ml-auto text-[10px]"
            >
              {listing.status.toUpperCase()}
            </Badge>
          </div>

          {showMatchScore && listing.match_score && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Match Score</span>
                <span className="font-bold text-primary">
                  {listing.match_score.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${listing.match_score}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
