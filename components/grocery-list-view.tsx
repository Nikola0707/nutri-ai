"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { updateGroceryItem, addGroceryItem, deleteGroceryItem } from "@/lib/actions"

interface GroceryListViewProps {
  groceryList: any
  userId: string
}

const CATEGORIES = ["Produce", "Dairy", "Meat & Seafood", "Pantry", "Frozen", "Bakery", "Beverages", "Snacks", "Other"]

export function GroceryListView({ groceryList, userId }: GroceryListViewProps) {
  const [items, setItems] = useState(groceryList.grocery_list_items || [])
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unit: "",
    category: "Other",
  })
  const [isAdding, setIsAdding] = useState(false)

  // Group items by category
  const itemsByCategory = items.reduce((acc: any, item: any) => {
    const category = item.category || "Other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {})

  const handleToggleItem = async (itemId: string, isPurchased: boolean) => {
    try {
      await updateGroceryItem(itemId, { is_purchased: isPurchased })
      setItems((prev: any[]) =>
        prev.map((item) => (item.id === itemId ? { ...item, is_purchased: isPurchased } : item)),
      )
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.name.trim()) return

    setIsAdding(true)
    try {
      const result = await addGroceryItem({
        groceryListId: groceryList.id,
        name: newItem.name,
        quantity: newItem.quantity || null,
        unit: newItem.unit || null,
        category: newItem.category,
      })

      if (result.success && result.item) {
        setItems((prev: any[]) => [...prev, result.item])
        setNewItem({ name: "", quantity: "", unit: "", category: "Other" })
      }
    } catch (error) {
      console.error("Error adding item:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteGroceryItem(itemId)
      setItems((prev: any[]) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const totalItems = items.length
  const completedItems = items.filter((item: any) => item.is_purchased).length
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold">
                {completedItems} / {totalItems}
              </p>
              <p className="text-sm text-muted-foreground">Items completed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <div>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isAdding || !newItem.name.trim()}>
              {isAdding ? "Adding..." : "Add Item"}
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Items by Category */}
      <div className="space-y-4">
        {Object.entries(itemsByCategory).map(([category, categoryItems]: [string, any]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category}</span>
                <Badge variant="outline">{categoryItems.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryItems.map((item: any) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      item.is_purchased ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={item.is_purchased}
                        onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)}
                      />
                      <div className={item.is_purchased ? "line-through text-muted-foreground" : ""}>
                        <p className="font-medium">{item.name}</p>
                        {item.quantity && (
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalItems === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No items in this list yet. Add some items above to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
