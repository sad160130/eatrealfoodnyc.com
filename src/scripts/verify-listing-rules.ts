import { ineligibilityReasons, isDirectoryEligible, isPublishableType } from "../config/publishable-types"

function codes(name: string, type: string | null): string[] {
  return ineligibilityReasons({ name, type }).map((reason) => reason.code)
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(message)
    process.exit(1)
  }
}

assert(codes("Alamo Drafthouse Cinema Lower Manhattan", "Restaurant").includes("non-food"), "cinema should be flagged")
assert(codes("Denny's", "Restaurant").includes("chain"), "Denny's should be flagged")
assert(codes("Foods of NY Tours", "Sightseeing tour agency").includes("type-not-allowed"), "tour agency type should be flagged")
assert(codes("Foods of NY Tours", "Sightseeing tour agency").includes("non-food"), "tour name should be flagged")
assert(codes("Cedar Star Catering", "Caterer").includes("catering"), "catering name should be flagged")
assert(codes("Cedar Star Catering", "Caterer").includes("type-not-allowed"), "caterer type should be flagged")
assert(isDirectoryEligible({ name: "Karahi King Restaurant & Catering", type: "Halal restaurant" }), "restaurant that also caters should stay")
assert(isDirectoryEligible({ name: "Broad Nosh Bagels Deli & Catering 42nd Street", type: "Bagel shop" }), "bagel shop should stay")
assert(isDirectoryEligible({ name: "Tourmaline", type: "Fine dining restaurant" }), "Tourmaline is a restaurant")
assert(isPublishableType("Southern restaurant (US)"), "cuisine restaurant types should pass")
assert(isPublishableType("Japanese steakhouse"), "steakhouse should pass")
assert(!isPublishableType("Grocery store"), "grocery stores are not restaurants")
assert(!isPublishableType("Hotel"), "hotels are not restaurants")
assert(!isDirectoryEligible({ name: "McDonald's", type: "Fast food restaurant" }), "McDonald's should be blocked")

console.log("listing rule checks passed")
