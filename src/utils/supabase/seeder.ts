import { seedAccounts, seedCategories, seedTransactions, seedBudgets, seedBudgetCategories } from '@/data/seedData'

export async function seedUserDatabase(supabase: any, userId: string) {
  try {
    // 1. Fetch Categories from database to map names to actual UUIDs
    const { data: dbCategories, error: catError } = await supabase
      .from('categories')
      .select('id, name')

    if (catError) throw catError
    if (!dbCategories || dbCategories.length === 0) {
      throw new Error('No categories found in the database. Please run the SQL schema migrations first.')
    }

    // Map category name to its database UUID
    const categoryNameMap: Record<string, string> = {}
    dbCategories.forEach((cat: any) => {
      categoryNameMap[cat.name.toLowerCase()] = cat.id
    })

    // Map static seed ID to database UUID
    const categoryIdMap: Record<string, string> = {}
    seedCategories.forEach((seedCat) => {
      const dbId = categoryNameMap[seedCat.name.toLowerCase()]
      if (dbId) {
        categoryIdMap[seedCat.id] = dbId
      }
    })

    // 2. Insert Accounts and capture their new database UUIDs
    const accountIdMap: Record<string, string> = {}
    
    for (const acc of seedAccounts) {
      // Remove hardcoded id and add user_id
      const { id, ...accountData } = acc as any
      const { data: insertedAcc, error: accError } = await supabase
        .from('accounts')
        .insert({
          ...accountData,
          user_id: userId
        })
        .select('id')
        .single()

      if (accError) throw accError
      if (insertedAcc) {
        accountIdMap[acc.id] = insertedAcc.id
      }
    }

    // 3. Insert Budgets and capture their new database UUIDs
    const budgetIdMap: Record<string, string> = {}

    for (const budget of seedBudgets) {
      const { id, ...budgetData } = budget as any
      const { data: insertedBudget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          user_id: userId
        })
        .select('id')
        .single()

      if (budgetError) throw budgetError
      if (insertedBudget) {
        budgetIdMap[budget.id] = insertedBudget.id
      }
    }

    // 4. Insert Transactions mapped to correct database categories and accounts
    const formattedTransactions = seedTransactions.map((tx) => {
      const { id, category_id, account_id, ...txData } = tx as any
      
      // Get mapped category UUID
      const originalCat = seedCategories.find(c => c.id === category_id)
      const dbCategoryId = originalCat ? categoryNameMap[originalCat.name.toLowerCase()] : null
      
      // Get mapped account UUID
      const dbAccountId = accountIdMap[account_id]

      return {
        ...txData,
        user_id: userId,
        account_id: dbAccountId,
        category_id: dbCategoryId
      }
    }).filter(tx => tx.account_id) // Safety filter

    const { error: txError } = await supabase
      .from('transactions')
      .insert(formattedTransactions)

    if (txError) throw txError

    // 5. Insert Budget Categories mapped to correct database categories and budgets
    const formattedBudgetCategories = seedBudgetCategories.map((bc) => {
      const { id, budget_id, category_id, ...bcData } = bc as any
      
      // Get mapped budget UUID
      const dbBudgetId = budgetIdMap[budget_id]

      // Get mapped category UUID
      const originalCat = seedCategories.find(c => c.id === category_id)
      const dbCategoryId = originalCat ? categoryNameMap[originalCat.name.toLowerCase()] : null

      return {
        ...bcData,
        budget_id: dbBudgetId,
        category_id: dbCategoryId
      }
    }).filter(bc => bc.budget_id && bc.category_id) // Safety filter

    const { error: bcError } = await supabase
      .from('budget_categories')
      .insert(formattedBudgetCategories)

    if (bcError) throw bcError

    return { success: true }
  } catch (err: any) {
    console.error('Error seeding database for user:', err)
    return { success: false, error: err.message || err }
  }
}
