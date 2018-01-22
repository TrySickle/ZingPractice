import { UserRoleType, StudyConditionType } from './enums';

export function EnumDecorator(constructor: Function) {
    constructor.prototype.UserRoleType = UserRoleType;
    constructor.prototype.StudyConditionType = StudyConditionType;
}