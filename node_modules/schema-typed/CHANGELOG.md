## [2.0.3](https://github.com/rsuite/schema-typed/compare/2.0.2...2.0.3) (2022-06-30)


### Bug Fixes

* **ObjectType:** specifies type of property `object` in the `ObjectType` check result ([#46](https://github.com/rsuite/schema-typed/issues/46)) ([0571e09](https://github.com/rsuite/schema-typed/commit/0571e097217b0c999acaf9e5780bdd289aa46a46))



# 2.0.2

- build(deps): add @babel/runtime #37

# 2.0.1

- fix ArrayType.of type error #35

# 2.0.0

- feat(locales): add default error messages for all checks ([#27](https://github.com/rsuite/schema-typed/issues/27)) ([03e21d7](https://github.com/rsuite/schema-typed/commit/03e21d77e9a6e0cd4fddcb1adfe8c485025f246b))
- refactor: refactor the project through typescript.
- feat(MixedType): Added support for `when` method on all types
- feat(MixedType): Replace Type with MixedType.
- feat(ObjectType): Support nested objects in the `shape` method of ObjectType.

# 1.5.1

- Update the typescript definition of `addRule`

# 1.5.0

- Added support for `isRequiredOrEmpty` in StringType and ArrayType

# 1.4.0

- Adding the typescript types declaration in to package

# 1.3.1

- Fixed an issue where `isOneOf` was not valid in `StringType` (#18)

# 1.3.0

- Added support for ESM

# 1.2.2

> Aug 30, 2019

- **Bugfix**: Fix an issue where addRule is not called

# 1.2.0

> Aug 20, 2019

- **Feature**: Support for async check. ([#14])

---

[#14]: https://github.com/rsuite/rsuite/pull/14
