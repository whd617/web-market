import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

jest.mock('./entities/user.entity');

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  findOneByOrFail: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  findOneById: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let mailService: MailService;
  let jwtService: JwtService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService); // testing Service 가져오기
    mailService = module.get<MailService>(MailService); // testing Service 가져오기
    jwtService = module.get<JwtService>(JwtService); // testing Service 가져오기
    usersRepository = module.get(getRepositoryToken(User)); // testing Service 가져오기
    verificationsRepository = module.get(getRepositoryToken(Verification)); // testing Service 가져오기
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
      role: UserRole.Client,
    };

    // 이 테스트는 생성한 유저가 이미 DB에 있으면 성공의 여부 테스트
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });
  describe('login', () => {
    const loginAccountArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };
    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginAccountArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginAccountArgs);
      expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginAccountArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token: 'signed-token-baby',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't login account" });
    });
  });
  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user ', async () => {
      usersRepository.findOneByOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user if found', async () => {
      usersRepository.findOneByOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'Failed findById' });
    });
  });

  describe('editProfile', () => {
    const oldUser = {
      email: 'bs@email.com',
      verified: true,
    };
    const editProfileArgs = {
      userId: 1,
      input: { email: 'bs@new.com' },
    };

    const newVerification = {
      code: 'code',
    };

    const newUser = {
      verified: false,
      email: editProfileArgs.input.email,
    };
    it('should fail if email if find currently exist email', async () => {
      usersRepository.count.mockResolvedValue(editProfileArgs.userId);
      const result = await service.editProfile(editProfileArgs.userId, {
        email: editProfileArgs.input.email,
      });
      expect(usersRepository.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: false, error: 'The email is exist' });
    });

    it('should change email', async () => {
      usersRepository.count.mockResolvedValue(undefined);
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);
      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: editProfileArgs.userId,
        },
      });
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });

      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, {
        email: '12',
      });
      expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
    });
  });
  describe('deletAccount', () => {
    const mockedUser = {
      ok: true,
      id: 1,
      email: 'exists@email.com',
    };

    it('should remove the User Account', async () => {
      jest.spyOn(service, 'findById').mockImplementation(async () => {
        return { ok: true, user: expect.any(Object) };
      });
      usersRepository.delete.mockResolvedValue(mockedUser);
      const result = await service.deletAccount(mockedUser.id);
      expect(result).toEqual({
        ok: true,
        user: expect.any(Object),
      });
    });

    it('should fail on exception', async () => {
      jest.spyOn(service, 'findById').mockImplementation(async () => {
        throw new Error();
      });
      const result = await service.deletAccount(mockedUser.id);
      expect(result).toEqual({ ok: false, error: 'Could not delete profile.' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockVerification = {
        id: 1,
        user: {
          verified: false,
        },
      };
      verificationsRepository.findOne.mockResolvedValue(mockVerification);
      const result = await service.verifyEmail('');
      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockVerification.id,
      );
      expect(result).toEqual(result);
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification not found.' });
    });
    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({
        ok: false,
        error: 'Could not verify Email.',
      });
    });
  });
});
