# Nuber Eats(Web-market)

The Backend of Nubber Eats Clone

## User Entity:

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email
- Delete User Account

## Restaurant Model

- name
- category
- address
- coverImage

## Restaurant CRUD:

- Edit Restaurant
- Delete Restaurant

- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant
- Search Restaurant

- Create Dish
- Edit Dish
- Delete Dish

- Orders CRUD
- Orders Subscription (Owner, Customer, Delivery):

  - Pending Orders (Owner(Subscrition: newOrder)) (Customer(Trigger: createOrder(newOrder)))
  - Order Status ([Customer, Delivery, Owner](Subscrition: orderUpdate)) (Trigger: editOrder(orderUpdate))
  - Pending Pickup Order(Delivery) (Subscription: orderUpdate) (Trigger: editOrder(orderUpdate))

- Payments (CRON)
