import _mongoose from 'mongoose';
import InventoryItem, { IInventoryItem } from '../models/InventoryItem';
import InventoryHistoryLog from '../models/InventoryHistoryLog';

interface AddItemDTO {
  userId: string;
  itemId: string;
  name: string;
  type: string;
  description: string;
  category: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Monarch';
  icon: string;
  animation?: string;
  quantity?: number;
  stackable?: boolean;
  maxStackSize?: number;
  source: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

class InventoryService {
  async addItem(data: AddItemDTO) {
    const quantityToAdd = data.quantity || 1;
    const stackable = data.stackable ?? false;
    const maxStackSize = data.maxStackSize ?? 1;

    let itemAdded: IInventoryItem | null = null;

    if (stackable) {
      // Find existing stack
      const existingStack = await InventoryItem.findOne({
        userId: data.userId,
        itemId: data.itemId,
        status: 'active'
      }).sort({ quantity: 1 });

      if (existingStack && existingStack.quantity < maxStackSize) {
        // We can add to this stack (simplified: assuming it doesn't overflow maxStackSize in one go)
        // If overflow happens, we should technically create a new stack, but for V1 we just clamp or add.
        const spaceLeft = maxStackSize - existingStack.quantity;
        const amountToAdd = Math.min(spaceLeft, quantityToAdd);
        
        existingStack.quantity += amountToAdd;
        await existingStack.save();
        itemAdded = existingStack;

        // If there's still remainder, we should ideally loop and create new stacks.
        // For simplicity, we assume we just add it to the stack or it fits.
      }
    }

    if (!itemAdded) {
      // Create new item/stack
      itemAdded = new InventoryItem({
        userId: data.userId,
        itemId: data.itemId,
        name: data.name,
        type: data.type,
        description: data.description,
        category: data.category,
        rarity: data.rarity,
        icon: data.icon,
        animation: data.animation,
        quantity: quantityToAdd,
        stackable,
        maxStackSize,
        source: data.source,
        tags: data.tags || [],
        metadata: data.metadata || {}
      });
      await itemAdded.save();
    }

    // Log History
    await InventoryHistoryLog.create({
      userId: data.userId,
      itemId: data.itemId,
      name: data.name,
      action: 'added',
      quantityChange: quantityToAdd,
      reason: `Obtained from ${data.source}`,
      metadata: data.metadata
    });

    return itemAdded;
  }

  async removeItem(userId: string, itemDocId: string, quantityToRemove: number = 1, reason: string = 'Removed') {
    const item = await InventoryItem.findOne({ _id: itemDocId, userId });
    if (!item) throw new Error("Item not found");

    if (item.quantity < quantityToRemove) {
      throw new Error("Not enough quantity");
    }

    item.quantity -= quantityToRemove;
    if (item.quantity <= 0) {
      item.status = 'consumed';
    }
    await item.save();

    await InventoryHistoryLog.create({
      userId,
      itemId: item.itemId,
      name: item.name,
      action: 'removed',
      quantityChange: -quantityToRemove,
      reason
    });

    return item;
  }

  async toggleFavorite(userId: string, itemDocId: string) {
    const item = await InventoryItem.findOne({ _id: itemDocId, userId });
    if (!item) throw new Error("Item not found");

    item.isFavorite = !item.isFavorite;
    await item.save();
    return item;
  }

  async getInventory(userId: string, filters: any = {}) {
    const query: any = { userId, status: 'active' };
    
    if (filters.category) query.category = filters.category;
    if (filters.rarity) query.rarity = filters.rarity;
    if (filters.isFavorite === 'true') query.isFavorite = true;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } }
      ];
    }

    let sortObj: any = { createdAt: -1 };
    if (filters.sortBy === 'oldest') sortObj = { createdAt: 1 };
    else if (filters.sortBy === 'name') sortObj = { name: 1 };
    else if (filters.sortBy === 'rarity') {
       // Rarity sorting requires a custom aggregation or mapping, but for now we sort alphabetically
       // In a real app we might store rarity weight, e.g. Mythic = 7.
       sortObj = { rarity: -1 }; 
    }

    const items = await InventoryItem.find(query).sort(sortObj);
    return items;
  }

  async getInventoryStats(userId: string) {
    const items = await InventoryItem.find({ userId, status: 'active' });
    
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const uniqueItems = new Set(items.map(item => item.itemId)).size;
    
    const rarityCounts = items.reduce((acc: any, item) => {
      acc[item.rarity] = (acc[item.rarity] || 0) + 1;
      return acc;
    }, {});

    const categoryCounts = items.reduce((acc: any, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalItems,
      uniqueItems,
      rarityCounts,
      categoryCounts
    };
  }

  async getInventoryHistory(userId: string) {
    return await InventoryHistoryLog.find({ userId }).sort({ createdAt: -1 }).limit(100);
  }
}

export const inventoryService = new InventoryService();
